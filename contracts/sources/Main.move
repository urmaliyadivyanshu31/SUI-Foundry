module reputation::reputation_nft {
    use std::string::{Self, String};
    use sui::package;
    use sui::display;
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::Clock;
    use sui::vec_map::VecMap;

    // =================== Error Constants ===================
    const EUnauthorized: u64 = 2;
    const EInvalidTicket: u64 = 3;
    const ENotAdmin: u64 = 5;

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
        social_links: VecMap<String, String>, // platform -> url mapping
        achievements: vector<String>,
        created_at: u64,
        updated_at: u64,
        metadata: VecMap<String, String>, // extensible metadata
    }

    /// Upgrade Ticket - contains upgradeable fields
    public struct UpgradeTicket has key, store {
        id: UID,
        card_id: ID,
        target_user: address,
        new_profile_image: Option<String>,
        new_description: Option<String>,
        new_score: Option<u64>,
        new_tags: Option<vector<String>>, // Complete replacement
        new_social_links: Option<VecMap<String, String>>, // Complete replacement
        additional_achievements: Option<vector<String>>, // Added to existing ones
        new_metadata: Option<VecMap<String, String>>, // Complete replacement
        ticket_type: String,
        created_at: u64,
        expires_at: Option<u64>,
    }

    /// Admin capability - only the deployer has this
    public struct AdminCap has key {
        id: UID,
        admin_address: address,
    }

    /// Registry to track all cards and their stats
    public struct CardRegistry has key {
        id: UID,
        admin: address,
        total_cards: u64,
        cards_by_owner: Table<address, vector<ID>>,
        card_stats: Table<ID, CardStats>,
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

    public struct TicketMinted has copy, drop {
        ticket_id: ID,
        card_id: ID,
        ticket_type: String,
        target_user: address,
        timestamp: u64,
    }

    // =================== Initializer ===================

    /// Initialize the module with display standards and admin capabilities
    fun init(otw: REPUTATION_NFT, ctx: &mut TxContext) {
        let admin_address = ctx.sender();
        
        // Create the publisher object
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
            string::utf8(b"social_links"),
            string::utf8(b"achievements"),
        ];

        let card_values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{profile_image}"),
            string::utf8(b"https://reputation-cards.io/card/{id}"),
            string::utf8(b"https://reputation-cards.io"),
            string::utf8(b"Reputation Cards"),
            string::utf8(b"{score} Points"),
            string::utf8(b"{tags}"),
            string::utf8(b"{social_links}"),
            string::utf8(b"{achievements}"),
        ];

        let mut card_display = display::new_with_fields<ReputationCard>(
            &publisher, card_keys, card_values, ctx
        );
        card_display.update_version();

        // Set up display for UpgradeTicket
        let ticket_keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"ticket_type"),
            string::utf8(b"target_user"),
        ];

        let ticket_values = vector[
            string::utf8(b"Upgrade Ticket: {ticket_type}"),
            string::utf8(b"Use this ticket to upgrade your Reputation Card"),
            string::utf8(b"https://reputation-cards.io/ticket/{ticket_type}.png"),
            string::utf8(b"{ticket_type}"),
            string::utf8(b"For: {target_user}"),
        ];

        let mut ticket_display = display::new_with_fields<UpgradeTicket>(
            &publisher, ticket_keys, ticket_values, ctx
        );
        ticket_display.update_version();

        // Create admin capability - only for deployer
        let admin_cap = AdminCap {
            id: object::new(ctx),
            admin_address,
        };

        // Create card registry
        let registry = CardRegistry {
            id: object::new(ctx),
            admin: admin_address,
            total_cards: 0,
            cards_by_owner: table::new<address, vector<ID>>(ctx),
            card_stats: table::new<ID, CardStats>(ctx),
        };

        // Transfer objects
        transfer::public_transfer(publisher, admin_address);
        transfer::public_transfer(card_display, admin_address);
        transfer::public_transfer(ticket_display, admin_address);
        transfer::transfer(admin_cap, admin_address); // Private transfer - only admin can hold this
        transfer::share_object(registry);
    }

    // =================== Admin Only Functions ===================

    /// Mint a new reputation card for a specific user (Admin only)
    public fun mint_reputation_card_for_user(
        admin_cap: &AdminCap,
        user_address: address,
        name: String,
        profile_image: String,
        description: String,
        initial_score: u64,
        initial_tags: vector<String>,
        initial_social_links: VecMap<String, String>,
        initial_achievements: vector<String>,
        initial_metadata: VecMap<String, String>,
        clock: &Clock,
        registry: &mut CardRegistry,
        ctx: &mut TxContext
    ) {
        // Verify admin
        assert!(ctx.sender() == admin_cap.admin_address, ENotAdmin);
        
        let card_id = object::new(ctx);
        let card_uid = card_id.to_inner();
        let timestamp = clock.timestamp_ms();

        let card = ReputationCard {
            id: card_id,
            name,
            profile_image,
            description,
            score: initial_score,
            tags: initial_tags,
            social_links: initial_social_links,
            achievements: initial_achievements,
            created_at: timestamp,
            updated_at: timestamp,
            metadata: initial_metadata,
        };

        // Update registry
        registry.total_cards = registry.total_cards + 1;
        
        let stats = CardStats {
            owner: user_address,
            mint_time: timestamp,
            upgrade_count: 0,
            last_upgrade: 0,
        };
        
        registry.card_stats.add(card_uid, stats);

        // Update owner's cards list
        if (registry.cards_by_owner.contains(user_address)) {
            let owner_cards = registry.cards_by_owner.borrow_mut(user_address);
            owner_cards.push_back(card_uid);
        } else {
            let mut new_list = vector::empty<ID>();
            new_list.push_back(card_uid);
            registry.cards_by_owner.add(user_address, new_list);
        };

        // Emit event
        event::emit(CardMinted {
            card_id: card_uid,
            owner: user_address,
            name: card.name,
            score: card.score,
            timestamp,
        });

        // Transfer card to user
        transfer::public_transfer(card, user_address);
    }

    /// Mint an upgrade ticket for a specific user (Admin only)
    public fun mint_upgrade_ticket_for_user(
        admin_cap: &AdminCap,
        card_id: ID,
        target_user: address,
        ticket_type: String,
        new_profile_image: Option<String>,
        new_description: Option<String>,
        new_score: Option<u64>,
        new_tags: Option<vector<String>>,
        new_social_links: Option<VecMap<String, String>>,
        additional_achievements: Option<vector<String>>,
        new_metadata: Option<VecMap<String, String>>,
        expires_at: Option<u64>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify admin
        assert!(ctx.sender() == admin_cap.admin_address, ENotAdmin);
        
        let ticket_id = object::new(ctx);
        let ticket_uid = ticket_id.to_inner();
        let timestamp = clock.timestamp_ms();

        let ticket = UpgradeTicket {
            id: ticket_id,
            card_id,
            target_user,
            new_profile_image,
            new_description,
            new_score,
            new_tags,
            new_social_links,
            additional_achievements,
            new_metadata,
            ticket_type,
            created_at: timestamp,
            expires_at,
        };

        // Emit event
        event::emit(TicketMinted {
            ticket_id: ticket_uid,
            card_id,
            ticket_type,
            target_user,
            timestamp,
        });

        // Transfer ticket to target user
        transfer::public_transfer(ticket, target_user);
    }

    // =================== Public Functions ===================

    /// Upgrade a reputation card using a ticket (User can call this)
    public fun upgrade_card(
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
            mut new_profile_image,
            mut new_description,
            mut new_score,
            mut new_tags,
            mut new_social_links,
            mut additional_achievements,
            mut new_metadata,
            ticket_type: _,
            created_at: _,
            expires_at,
        } = ticket;

        let current_time = clock.timestamp_ms();
        let card_object_id = object::id(card);
        let sender = ctx.sender();

        // Validate ticket
        assert!(card_id == card_object_id, EInvalidTicket);
        assert!(target_user == sender, EUnauthorized);
        
        // Check expiration
        if (expires_at.is_some()) {
            assert!(current_time <= *expires_at.borrow(), EInvalidTicket);
        };

        // Apply upgrades - everything except name
        if (new_profile_image.is_some()) {
            card.profile_image = new_profile_image.extract();
        };

        if (new_description.is_some()) {
            card.description = new_description.extract();
        };

        if (new_score.is_some()) {
            card.score = new_score.extract();
        };

        // Tags - complete replacement
        if (new_tags.is_some()) {
            card.tags = new_tags.extract();
        };

        // Social links - complete replacement
        if (new_social_links.is_some()) {
            card.social_links = new_social_links.extract();
        };

        // Achievements - add to existing ones (don't replace)
        if (additional_achievements.is_some()) {
            let achievements_to_add = additional_achievements.extract();
            let mut i = 0;
            while (i < achievements_to_add.length()) {
                let achievement = achievements_to_add[i];
                if (!card.achievements.contains(&achievement)) {
                    card.achievements.push_back(achievement);
                };
                i = i + 1;
            };
        };

        // Metadata - complete replacement
        if (new_metadata.is_some()) {
            card.metadata = new_metadata.extract();
        };

        // Update timestamp
        card.updated_at = current_time;

        // Update registry stats
        let stats = registry.card_stats.borrow_mut(card_object_id);
        stats.upgrade_count = stats.upgrade_count + 1;
        stats.last_upgrade = current_time;

        // Emit event
        event::emit(CardUpgraded {
            card_id: card_object_id,
            owner: sender,
            ticket_id: object::uid_to_inner(&id),
            new_score: card.score,
            timestamp: current_time,
        });

        // Destroy the ticket
        object::delete(id);
    }

    // =================== View Functions ===================

    /// Get card basic info
    public fun get_card_info(card: &ReputationCard): (String, String, String, u64) {
        (card.name, card.profile_image, card.description, card.score)
    }

    /// Get card social links
    public fun get_social_links(card: &ReputationCard): &VecMap<String, String> {
        &card.social_links
    }

    /// Get card tags
    public fun get_tags(card: &ReputationCard): &vector<String> {
        &card.tags
    }

    /// Get card achievements
    public fun get_achievements(card: &ReputationCard): &vector<String> {
        &card.achievements
    }

    /// Get card metadata
    public fun get_metadata(card: &ReputationCard): &VecMap<String, String> {
        &card.metadata
    }

    /// Get card timestamps
    public fun get_timestamps(card: &ReputationCard): (u64, u64) {
        (card.created_at, card.updated_at)
    }

    /// Get total cards count
    public fun get_total_cards(registry: &CardRegistry): u64 {
        registry.total_cards
    }

    /// Get cards owned by address
    public fun get_cards_by_owner(registry: &CardRegistry, owner: address): &vector<ID> {
        registry.cards_by_owner.borrow(owner)
    }

    /// Get card stats
    public fun get_card_stats(registry: &CardRegistry, card_id: ID): &CardStats {
        registry.card_stats.borrow(card_id)
    }

    /// Get admin address from registry
    public fun get_admin_address(registry: &CardRegistry): address {
        registry.admin
    }

    /// Check if address is admin
    public fun is_admin(admin_cap: &AdminCap, address: address): bool {
        admin_cap.admin_address == address
    }

    // =================== Admin Management Functions ===================

    /// Transfer admin capability to new admin (Current admin only)
    public fun transfer_admin_cap(
        admin_cap: AdminCap,
        new_admin: address,
        registry: &mut CardRegistry,
        ctx: &mut TxContext
    ) {
        // Verify current admin
        assert!(ctx.sender() == admin_cap.admin_address, ENotAdmin);
        
        // Update registry admin
        registry.admin = new_admin;
        
        // Update admin cap and transfer
        let AdminCap { mut id, admin_address: _ } = admin_cap;
        let new_admin_cap = AdminCap {
            id: object::new(ctx),
            admin_address: new_admin,
        };
        
        // Delete the old UID
        object::delete(id);
        
        // Transfer to new admin
        transfer::transfer(new_admin_cap, new_admin);
    }
}