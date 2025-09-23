/// SuiDentity Quest and Achievement System
/// This module manages quests, achievements, and XP for gamification
module suidentity::quest_system {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;
    use sui::dynamic_field;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};

    // ===== Error Codes =====
    const ENotAuthorized: u64 = 1;
    const EQuestNotActive: u64 = 2;
    const EQuestAlreadyCompleted: u64 = 3;
    const EInvalidXPAmount: u64 = 4;
    const EInsufficientReward: u64 = 5;
    const EQuestNotFound: u64 = 6;

    // ===== Structs =====

    /// One-time witness for the module
    struct QUEST_SYSTEM has drop {}

    /// Quest definition
    struct Quest has key, store {
        id: UID,
        title: String,
        description: String,
        quest_type: String, // onboarding, social, github, reputation, nft
        xp_reward: u16,
        sui_reward: u64, // Optional SUI reward in MIST
        requirements: vector<String>, // JSON-encoded requirements
        is_active: bool,
        created_at: u64,
    }

    /// User progress tracking
    struct UserProgress has key, store {
        id: UID,
        user: address,
        total_xp: u32,
        level: u16,
        completed_quests: vector<address>, // Quest IDs
        current_streak: u16,
        longest_streak: u16,
        last_activity: u64,
    }

    /// Quest completion record
    struct QuestCompletion has store, copy, drop {
        quest_id: address,
        completed_at: u64,
        xp_earned: u16,
        sui_earned: u64,
    }

    /// Achievement definition
    struct Achievement has key, store {
        id: UID,
        name: String,
        description: String,
        badge_type: String, // social, defi, developer, milestone
        image_url: String,
        requirements: vector<String>,
        is_active: bool,
        created_at: u64,
    }

    /// Quest system admin capability
    struct QuestAdminCap has key, store {
        id: UID,
    }

    /// Reward pool for quest rewards
    struct RewardPool has key {
        id: UID,
        balance: Balance<SUI>,
    }

    // ===== Events =====

    struct QuestCreated has copy, drop {
        quest_id: address,
        title: String,
        xp_reward: u16,
        sui_reward: u64,
        timestamp: u64,
    }

    struct QuestCompleted has copy, drop {
        quest_id: address,
        user: address,
        xp_earned: u16,
        sui_earned: u64,
        new_level: u16,
        timestamp: u64,
    }

    struct LevelUp has copy, drop {
        user: address,
        old_level: u16,
        new_level: u16,
        total_xp: u32,
        timestamp: u64,
    }

    struct AchievementUnlocked has copy, drop {
        achievement_id: address,
        user: address,
        achievement_name: String,
        timestamp: u64,
    }

    struct StreakUpdated has copy, drop {
        user: address,
        streak: u16,
        is_new_record: bool,
        timestamp: u64,
    }

    // ===== Module Initializer =====

    fun init(witness: QUEST_SYSTEM, ctx: &mut TxContext) {
        let admin_cap = QuestAdminCap {
            id: object::new(ctx),
        };

        let reward_pool = RewardPool {
            id: object::new(ctx),
            balance: balance::zero(),
        };

        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(reward_pool);
    }

    // ===== Quest Management =====

    /// Create a new quest
    public fun create_quest(
        admin_cap: &QuestAdminCap,
        title: String,
        description: String,
        quest_type: String,
        xp_reward: u16,
        sui_reward: u64,
        requirements: vector<String>,
        clock: &Clock,
        ctx: &mut TxContext
    ): Quest {
        assert!(xp_reward > 0, EInvalidXPAmount);

        let current_time = clock::timestamp_ms(clock);
        
        let quest = Quest {
            id: object::new(ctx),
            title,
            description,
            quest_type,
            xp_reward,
            sui_reward,
            requirements,
            is_active: true,
            created_at: current_time,
        };

        event::emit(QuestCreated {
            quest_id: object::uid_to_address(&quest.id),
            title: quest.title,
            xp_reward,
            sui_reward,
            timestamp: current_time,
        });

        quest
    }

    /// Toggle quest active status
    public fun toggle_quest_status(
        quest: &mut Quest,
        admin_cap: &QuestAdminCap,
    ) {
        quest.is_active = !quest.is_active;
    }

    /// Complete a quest for a user
    public fun complete_quest(
        quest: &Quest,
        user_progress: &mut UserProgress,
        reward_pool: &mut RewardPool,
        admin_cap: &QuestAdminCap,
        clock: &Clock,
        ctx: &mut TxContext
    ): Option<Coin<SUI>> {
        assert!(quest.is_active, EQuestNotActive);
        
        let quest_id = object::uid_to_address(&quest.id);
        assert!(!vector::contains(&user_progress.completed_quests, &quest_id), EQuestAlreadyCompleted);

        let current_time = clock::timestamp_ms(clock);
        
        // Update user progress
        vector::push_back(&mut user_progress.completed_quests, quest_id);
        user_progress.total_xp = user_progress.total_xp + (quest.xp_reward as u32);
        
        // Calculate new level
        let old_level = user_progress.level;
        let new_level = calculate_level(user_progress.total_xp);
        user_progress.level = new_level;

        // Update streak if consecutive day
        update_streak(user_progress, current_time);

        // Store completion record
        let completion = QuestCompletion {
            quest_id,
            completed_at: current_time,
            xp_earned: quest.xp_reward,
            sui_earned: quest.sui_reward,
        };
        dynamic_field::add(&mut user_progress.id, quest_id, completion);

        // Emit events
        event::emit(QuestCompleted {
            quest_id,
            user: user_progress.user,
            xp_earned: quest.xp_reward,
            sui_earned: quest.sui_reward,
            new_level,
            timestamp: current_time,
        });

        if (new_level > old_level) {
            event::emit(LevelUp {
                user: user_progress.user,
                old_level,
                new_level,
                total_xp: user_progress.total_xp,
                timestamp: current_time,
            });
        };

        // Handle SUI reward
        if (quest.sui_reward > 0) {
            assert!(balance::value(&reward_pool.balance) >= quest.sui_reward, EInsufficientReward);
            let reward_balance = balance::split(&mut reward_pool.balance, quest.sui_reward);
            let reward_coin = coin::from_balance(reward_balance, ctx);
            option::some(reward_coin)
        } else {
            option::none()
        }
    }

    /// Initialize user progress
    public fun create_user_progress(
        user: address,
        clock: &Clock,
        ctx: &mut TxContext
    ): UserProgress {
        let current_time = clock::timestamp_ms(clock);
        
        UserProgress {
            id: object::new(ctx),
            user,
            total_xp: 0,
            level: 1,
            completed_quests: vector::empty(),
            current_streak: 0,
            longest_streak: 0,
            last_activity: current_time,
        }
    }

    // ===== Achievement System =====

    /// Create a new achievement
    public fun create_achievement(
        admin_cap: &QuestAdminCap,
        name: String,
        description: String,
        badge_type: String,
        image_url: String,
        requirements: vector<String>,
        clock: &Clock,
        ctx: &mut TxContext
    ): Achievement {
        let current_time = clock::timestamp_ms(clock);
        
        Achievement {
            id: object::new(ctx),
            name,
            description,
            badge_type,
            image_url,
            requirements,
            is_active: true,
            created_at: current_time,
        }
    }

    /// Check if user qualifies for achievement
    public fun check_achievement_eligibility(
        achievement: &Achievement,
        user_progress: &UserProgress,
    ): bool {
        // This would implement complex logic based on requirements
        // For now, we'll return a simple check
        achievement.is_active && user_progress.level >= 5
    }

    /// Award achievement to user
    public fun award_achievement(
        achievement: &Achievement,
        user_progress: &mut UserProgress,
        admin_cap: &QuestAdminCap,
        clock: &Clock,
    ) {
        let achievement_id = object::uid_to_address(&achievement.id);
        let current_time = clock::timestamp_ms(clock);

        // Store achievement record
        dynamic_field::add(&mut user_progress.id, achievement_id, current_time);

        event::emit(AchievementUnlocked {
            achievement_id,
            user: user_progress.user,
            achievement_name: achievement.name,
            timestamp: current_time,
        });
    }

    // ===== Reward Pool Management =====

    /// Add funds to reward pool
    public fun fund_reward_pool(
        reward_pool: &mut RewardPool,
        payment: Coin<SUI>,
    ) {
        let balance = coin::into_balance(payment);
        balance::join(&mut reward_pool.balance, balance);
    }

    /// Withdraw from reward pool (admin only)
    public fun withdraw_from_pool(
        reward_pool: &mut RewardPool,
        admin_cap: &QuestAdminCap,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<SUI> {
        assert!(balance::value(&reward_pool.balance) >= amount, EInsufficientReward);
        let withdrawn = balance::split(&mut reward_pool.balance, amount);
        coin::from_balance(withdrawn, ctx)
    }

    // ===== View Functions =====

    /// Get quest information
    public fun get_quest_info(quest: &Quest): (
        String, // title
        String, // description
        String, // quest_type
        u16,    // xp_reward
        u64,    // sui_reward
        bool,   // is_active
        u64,    // created_at
    ) {
        (
            quest.title,
            quest.description,
            quest.quest_type,
            quest.xp_reward,
            quest.sui_reward,
            quest.is_active,
            quest.created_at,
        )
    }

    /// Get user progress
    public fun get_user_progress(progress: &UserProgress): (
        address, // user
        u32,     // total_xp
        u16,     // level
        u16,     // current_streak
        u16,     // longest_streak
        u64,     // last_activity
    ) {
        (
            progress.user,
            progress.total_xp,
            progress.level,
            progress.current_streak,
            progress.longest_streak,
            progress.last_activity,
        )
    }

    /// Check if quest is completed by user
    public fun is_quest_completed(progress: &UserProgress, quest_id: address): bool {
        vector::contains(&progress.completed_quests, &quest_id)
    }

    /// Get quest completion details
    public fun get_quest_completion(progress: &UserProgress, quest_id: address): (u64, u16, u64) {
        let completion: &QuestCompletion = dynamic_field::borrow(&progress.id, quest_id);
        (completion.completed_at, completion.xp_earned, completion.sui_earned)
    }

    /// Get reward pool balance
    public fun get_pool_balance(pool: &RewardPool): u64 {
        balance::value(&pool.balance)
    }

    // ===== Helper Functions =====

    /// Calculate level from total XP
    fun calculate_level(total_xp: u32): u16 {
        // Level calculation: 100 XP for level 1, increases by 50 each level
        if (total_xp < 100) {
            1
        } else {
            let level = 1 + ((total_xp - 100) / 150);
            if (level > 100) { 100 } else { (level as u16) }
        }
    }

    /// Update user streak
    fun update_streak(progress: &mut UserProgress, current_time: u64) {
        let days_since_last = (current_time - progress.last_activity) / (24 * 60 * 60 * 1000); // Convert to days
        
        if (days_since_last == 1) {
            // Consecutive day
            progress.current_streak = progress.current_streak + 1;
            if (progress.current_streak > progress.longest_streak) {
                progress.longest_streak = progress.current_streak;
                
                event::emit(StreakUpdated {
                    user: progress.user,
                    streak: progress.current_streak,
                    is_new_record: true,
                    timestamp: current_time,
                });
            }
        } else if (days_since_last > 1) {
            // Streak broken
            progress.current_streak = 1;
        };
        
        progress.last_activity = current_time;
    }

    // ===== Admin Functions =====

    /// Create additional admin capabilities
    public fun create_admin_cap(
        _admin_cap: &QuestAdminCap,
        ctx: &mut TxContext
    ): QuestAdminCap {
        QuestAdminCap {
            id: object::new(ctx),
        }
    }

    /// Destroy admin capability
    public fun destroy_admin_cap(admin_cap: QuestAdminCap) {
        let QuestAdminCap { id } = admin_cap;
        object::delete(id);
    }

    // ===== Test Functions =====

    #[test_only]
    use sui::test_scenario;

    #[test]
    fun test_quest_system() {
        let admin = @0x1;
        let user = @0x2;
        
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        
        // Initialize module
        {
            let ctx = test_scenario::ctx(scenario);
            init(QUEST_SYSTEM {}, ctx);
        };

        // Create quest and user progress
        test_scenario::next_tx(scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<QuestAdminCap>(scenario);
            let clock = sui::clock::create_for_testing(test_scenario::ctx(scenario));
            let ctx = test_scenario::ctx(scenario);
            
            let quest = create_quest(
                &admin_cap,
                string::utf8(b"First Steps"),
                string::utf8(b"Complete your profile"),
                string::utf8(b"onboarding"),
                50,
                0,
                vector::empty(),
                &clock,
                ctx
            );

            let progress = create_user_progress(user, &clock, ctx);
            
            transfer::share_object(quest);
            transfer::transfer(progress, user);
            test_scenario::return_to_sender(scenario, admin_cap);
            sui::clock::destroy_for_testing(clock);
        };

        test_scenario::end(scenario_val);
    }
}