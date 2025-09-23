module reputation::reputation_nft {
    use std::string::{Self, String};
    use sui::package;
    use sui::display;
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::Clock;
    use sui::vec_map::{Self, VecMap};
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
    use sui::transfer;

    // =================== Error Constants ===================
    const EAlreadyHasCard: u64 = 1;
    const EUnauthorized: u64 = 2;
    const EInvalidTicket: u64 = 3;
    const ECardNotFound: u64 = 4;
    const ENotAdmin: u64 = 5;
    const ENameTooLong: u64 = 6;
    const EDescriptionTooLong: u64 = 7;
    const EInvalidScore: u64 = 8;
    const ETooManySocialLinks: u64 = 9;

    // =================== Constants ===================
    const MAX_NAME_LENGTH: u64 = 50;
    const MAX_DESCRIPTION_LENGTH: u64 = 500;
    const MAX_SOCIAL_LINKS: u64 = 10;
    const INITIAL_SCORE_MIN: u64 = 100;
    const INITIAL_SCORE_MAX: u64 = 300;

    // =================== Structs ===================

    /// One-Time-Witness for the module
    public struct REPUTATION_NFT has drop {}

    /// Main Reputation Card NFT struct
    public struct ReputationCard has key, store {
        id: UID,
        name: String,
        profile_image: String,
        description: String,
        score: u64,
        tags: vector<String>,
        social_links: VecMap<String, String>,
        achievements: vector<String>,
        created_at: u64,
        updated_at: u64,
        metadata: VecMap<String, String>,
        is_verified: bool,
        update_count: u64,
    }

    /// Upgrade Ticket - for special rewards and score boosts
    public struct UpgradeTicket has key, store {
        id: UID,
        card_id: ID,
        target_user: address,
        new_profile_image: Option<String>,
        new_description: Option<String>,
        score_boost: Option<u64>, // Changed from new_score to score_boost
        new_tags: Option<vector<String>>,
        new_social_links: Option<VecMap<String, String>>,
        additional_achievements: Option<vector<String>>,
        new_metadata: Option<VecMap<String, String>>,
        ticket_type: String,
        created_at: u64,
        expires_at: Option<u64>,
    }

    /// Admin capability - for special operations only
    public struct AdminCap has key {
        id: UID,
        admin_address: address,
    }

    /// Registry to track all cards
    public struct CardRegistry has key {
        id: UID,
        admin: address,
        total_cards: u64,
        cards_by_owner: Table<address, ID>, // Changed to single ID per owner
        card_stats: Table<ID, CardStats>,
        verification_scores: Table<address, u64>, // Stores verification-based initial scores
    }

    /// Card statistics
    public struct CardStats has store {
        owner: address,
        mint_time: u64,
        upgrade_count: u64,
        last_upgrade: u64,
    }

    // =================== Events ===================

    public struct CardMinted has copy, drop {
        card_id: ID,
        owner: address,
        name: String,
        score: u64,
        timestamp: u64,
    }

    public struct CardUpgraded has copy, drop {
        card_id: ID,
        owner: address,
        ticket_id: ID,
        new_score: u64,
        timestamp: u64,
    }

    public struct CardSelfUpdated has copy, drop {
        card_id: ID,
        owner: address,
        update_type: String,
        timestamp: u64,
    }

    public struct TicketMinted has copy, drop {
        ticket_id: ID,
        card_id: ID,
        ticket_type: String,
        target_user: address,
        timestamp: u64,
    }

    // =================== Initializer ===================

    fun init(otw: REPUTATION_NFT, ctx: &mut TxContext) {
        let admin_address = tx_context::sender(ctx);
        
        let publisher = package::claim(otw, ctx);

        // Set up display for ReputationCard
        let card_keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"link"),
            string::utf8(b"project_url"),
            string::utf8(b"creator"),
            string::utf8(b"score"),
            string::utf8(b"tags"),
            string::utf8(b"verified"),
        ];

        let card_values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{profile_image}"),
            string::utf8(b"https://suidentity.xyz/card/{id}"),
            string::utf8(b"https://suidentity.xyz"),
            string::utf8(b"SuiDentity"),
            string::utf8(b"{score} Points"),
            string::utf8(b"{tags}"),
            string::utf8(b"{is_verified}"),
        ];

        let card_display = display::new_with_fields<ReputationCard>(
            &publisher, card_keys, card_values, ctx
        );
        display::update_version(&mut card_display);

        // Set up display for UpgradeTicket
        let ticket_keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"ticket_type"),
            string::utf8(b"target_user"),
        ];

        let ticket_values = vector[
            string::utf8(b"Upgrade Ticket: {ticket_type}"),
            string::utf8(b"Special reward ticket for reputation boost"),
            string::utf8(b"{ticket_type}"),
            string::utf8(b"{target_user}"),
        ];

        let ticket_display = display::new_with_fields<UpgradeTicket>(
            &publisher, ticket_keys, ticket_values, ctx
        );
        display::update_version(&mut ticket_display);

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
            admin_address,
        };

        // Create card registry
        let registry = CardRegistry {
            id: object::new(ctx),
            admin: admin_address,
            total_cards: 0,
            cards_by_owner: table::new<address, ID>(ctx),
            card_stats: table::new<ID, CardStats>(ctx),
            verification_scores: table::new<address, u64>(ctx),
        };

        transfer::public_transfer(publisher, admin_address);
        transfer::public_transfer(card_display, admin_address);
        transfer::public_transfer(ticket_display, admin_address);
        transfer::transfer(admin_cap, admin_address);
        transfer::share_object(registry);
    }

    // =================== User Self-Minting Functions ===================

    /// Users can mint their own reputation card (one per address)
    public entry fun mint_reputation_card(
        name: String,
        profile_image: String,
        description: String,
        initial_tags: vector<String>,
        initial_social_links: VecMap<String, String>,
        clock: &Clock,
        registry: &mut CardRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if user already has a card
        assert!(!table::contains(&registry.cards_by_owner, sender), EAlreadyHasCard);
        
        // Validate inputs
        assert!(string::length(&name) <= MAX_NAME_LENGTH, ENameTooLong);
        assert!(string::length(&description) <= MAX_DESCRIPTION_LENGTH, EDescriptionTooLong);
        assert!(vec_map::size(&initial_social_links) <= MAX_SOCIAL_LINKS, ETooManySocialLinks);
        
        let card_uid = object::new(ctx);
        let card_id = object::uid_to_inner(&card_uid);
        let timestamp = clock::timestamp_ms(clock);
        
        // Calculate initial score based on verification status
        let initial_score = calculate_initial_score(sender, registry);
        
        // Create the reputation card
        let card = ReputationCard {
            id: card_uid,
            name,
            profile_image,
            description,
            score: initial_score,
            tags: initial_tags,
            social_links: initial_social_links,
            achievements: vector::empty<String>(),
            created_at: timestamp,
            updated_at: timestamp,
            metadata: vec_map::empty<String, String>(),
            is_verified: false,
            update_count: 0,
        };

        // Update registry
        registry.total_cards = registry.total_cards + 1;
        table::add(&mut registry.cards_by_owner, sender, card_id);
        
        let stats = CardStats {
            owner: sender,
            mint_time: timestamp,
            upgrade_count: 0,
            last_upgrade: 0,
        };
        table::add(&mut registry.card_stats, card_id, stats);

        // Emit event
        event::emit(CardMinted {
            card_id,
            owner: sender,
            name: card.name,
            score: card.score,
            timestamp,
        });

        // Transfer card to sender
        transfer::public_transfer(card, sender);
    }

    /// Users can update their own card's basic metadata
    public entry fun update_own_card_metadata(
        card: &mut ReputationCard,
        new_profile_image: Option<String>,
        new_description: Option<String>,
        new_tags: Option<vector<String>>,
        new_social_links: Option<VecMap<String, String>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let timestamp = clock::timestamp_ms(clock);
        
        // Users can only update certain fields
        if (option::is_some(&new_profile_image)) {
            card.profile_image = option::extract(&mut new_profile_image);
        };
        
        if (option::is_some(&new_description)) {
            let desc = option::extract(&mut new_description);
            assert!(string::length(&desc) <= MAX_DESCRIPTION_LENGTH, EDescriptionTooLong);
            card.description = desc;
        };
        
        if (option::is_some(&new_tags)) {
            card.tags = option::extract(&mut new_tags);
        };
        
        if (option::is_some(&new_social_links)) {
            let links = option::extract(&mut new_social_links);
            assert!(vec_map::size(&links) <= MAX_SOCIAL_LINKS, ETooManySocialLinks);
            card.social_links = links;
        };
        
        card.updated_at = timestamp;
        card.update_count = card.update_count + 1;
        
        event::emit(CardSelfUpdated {
            card_id: object::id(card),
            owner: tx_context::sender(ctx),
            update_type: string::utf8(b"metadata_update"),
            timestamp,
        });
    }

    /// Add a social verification to increase score
    public entry fun add_social_verification(
        card: &mut ReputationCard,
        platform: String,
        username: String,
        verification_proof: String, // Could be a signature or hash
        clock: &Clock,
        registry: &mut CardRegistry,
        ctx: &mut TxContext
    ) {
        let timestamp = clock::timestamp_ms(clock);
        let sender = tx_context::sender(ctx);
        
        // Add to social links if not already present
        if (!vec_map::contains(&card.social_links, &platform)) {
            vec_map::insert(&mut card.social_links, platform, username);
            
            // Increase score for verified social connection
            card.score = card.score + 25; // 25 points per verified social
            card.is_verified = true;
            card.updated_at = timestamp;
            
            // Store verification in metadata
            vec_map::insert(&mut card.metadata, 
                string::utf8(b"verified_"), 
                verification_proof
            );
            
            event::emit(CardSelfUpdated {
                card_id: object::id(card),
                owner: sender,
                update_type: string::utf8(b"social_verification"),
                timestamp,
            });
        };
    }

    // =================== Upgrade Ticket System ===================

    /// Apply an upgrade ticket to a reputation card
    public entry fun apply_upgrade_ticket(
        card: &mut ReputationCard,
        ticket: UpgradeTicket,
        clock: &Clock,
        registry: &mut CardRegistry,
        ctx: &mut TxContext
    ) {
        let UpgradeTicket {
            id,
            card_id,
            target_user,
            new_profile_image,
            new_description,
            score_boost,
            new_tags,
            new_social_links,
            additional_achievements,
            new_metadata,
            ticket_type: _,
            created_at: _,
            expires_at,
        } = ticket;

        let current_time = clock::timestamp_ms(clock);
        let card_object_id = object::id(card);
        let sender = tx_context::sender(ctx);

        // Validate ticket
        assert!(card_id == card_object_id, EInvalidTicket);
        assert!(target_user == sender, EUnauthorized);
        
        // Check expiration
        if (option::is_some(&expires_at)) {
            assert!(current_time <= *option::borrow(&expires_at), EInvalidTicket);
        };

        // Apply upgrades
        if (option::is_some(&new_profile_image)) {
            card.profile_image = option::extract(&mut new_profile_image);
        };

        if (option::is_some(&new_description)) {
            card.description = option::extract(&mut new_description);
        };

        // Apply score boost (additive, not replacement)
        if (option::is_some(&score_boost)) {
            let boost = option::extract(&mut score_boost);
            card.score = card.score + boost;
        };

        if (option::is_some(&new_tags)) {
            card.tags = option::extract(&mut new_tags);
        };

        if (option::is_some(&new_social_links)) {
            card.social_links = option::extract(&mut new_social_links);
        };

        // Add achievements
        if (option::is_some(&additional_achievements)) {
            let achievements_to_add = option::extract(&mut additional_achievements);
            let i = 0;
            while (i < vector::length(&achievements_to_add)) {
                let achievement = *vector::borrow(&achievements_to_add, i);
                if (!vector::contains(&card.achievements, &achievement)) {
                    vector::push_back(&mut card.achievements, achievement);
                };
                i = i + 1;
            };
        };

        if (option::is_some(&new_metadata)) {
            card.metadata = option::extract(&mut new_metadata);
        };

        card.updated_at = current_time;

        // Update stats
        let stats = table::borrow_mut(&mut registry.card_stats, card_object_id);
        stats.upgrade_count = stats.upgrade_count + 1;
        stats.last_upgrade = current_time;

        event::emit(CardUpgraded {
            card_id: card_object_id,
            owner: sender,
            ticket_id: object::uid_to_inner(&id),
            new_score: card.score,
            timestamp: current_time,
        });

        object::delete(id);
    }

    // =================== Admin Functions (Limited) ===================

    /// Admin mints upgrade tickets as rewards
    public fun mint_reward_ticket(
        _admin_cap: &AdminCap,
        card_id: ID,
        target_user: address,
        ticket_type: String,
        score_boost: u64,
        achievements: vector<String>,
        expires_in_days: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let ticket_uid = object::new(ctx);
        let ticket_id = object::uid_to_inner(&ticket_uid);
        let timestamp = clock::timestamp_ms(clock);
        let expires_at = if (expires_in_days > 0) {
            option::some(timestamp + (expires_in_days * 24 * 60 * 60 * 1000))
        } else {
            option::none()
        };

        let ticket = UpgradeTicket {
            id: ticket_uid,
            card_id,
            target_user,
            new_profile_image: option::none(),
            new_description: option::none(),
            score_boost: option::some(score_boost),
            new_tags: option::none(),
            new_social_links: option::none(),
            additional_achievements: option::some(achievements),
            new_metadata: option::none(),
            ticket_type,
            created_at: timestamp,
            expires_at,
        };

        event::emit(TicketMinted {
            ticket_id,
            card_id,
            ticket_type,
            target_user,
            timestamp,
        });

        transfer::public_transfer(ticket, target_user);
    }

    /// Admin can set verification scores for addresses before they mint
    public fun set_verification_score(
        _admin_cap: &AdminCap,
        registry: &mut CardRegistry,
        user: address,
        score: u64,
        _ctx: &mut TxContext
    ) {
        assert!(score >= INITIAL_SCORE_MIN && score <= INITIAL_SCORE_MAX, EInvalidScore);
        
        if (table::contains(&registry.verification_scores, user)) {
            *table::borrow_mut(&mut registry.verification_scores, user) = score;
        } else {
            table::add(&mut registry.verification_scores, user, score);
        };
    }

    // =================== Helper Functions ===================

    fun calculate_initial_score(user: address, registry: &CardRegistry): u64 {
        // Check if admin has set a verification score
        if (table::contains(&registry.verification_scores, user)) {
            return *table::borrow(&registry.verification_scores, user)
        };
        
        // Default initial score
        INITIAL_SCORE_MIN
    }

    // =================== View Functions ===================

    public fun get_card_info(card: &ReputationCard): (String, String, String, u64, bool) {
        (card.name, card.profile_image, card.description, card.score, card.is_verified)
    }

    public fun get_social_links(card: &ReputationCard): &VecMap<String, String> {
        &card.social_links
    }

    public fun get_achievements(card: &ReputationCard): &vector<String> {
        &card.achievements
    }

    public fun get_card_score(card: &ReputationCard): u64 {
        card.score
    }

    public fun has_card(registry: &CardRegistry, owner: address): bool {
        table::contains(&registry.cards_by_owner, owner)
    }

    public fun get_card_id(registry: &CardRegistry, owner: address): Option<ID> {
        if (table::contains(&registry.cards_by_owner, owner)) {
            option::some(*table::borrow(&registry.cards_by_owner, owner))
        } else {
            option::none()
        }
    }

    public fun get_total_cards(registry: &CardRegistry): u64 {
        registry.total_cards
    }
}