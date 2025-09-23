/// SuiDentity - Dynamic Identity NFT System
/// This module implements identity NFTs that evolve with user reputation and social connections
module suidentity::identity_nft {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;
    use sui::dynamic_field;
    use sui::clock::{Self, Clock};

    // ===== Error Codes =====
    const ENotOwner: u64 = 1;
    const EInvalidReputationScore: u64 = 2;
    const EInvalidMetadataUrl: u64 = 3;
    const ESameOwner: u64 = 4;
    const EInvalidSocialPlatform: u64 = 5;

    // ===== Structs =====

    /// One-time witness for the module
    struct IDENTITY_NFT has drop {}

    /// Main Identity NFT object
    struct IdentityNFT has key, store {
        id: UID,
        owner: address,
        name: String,
        description: String,
        image_url: Url,
        metadata_url: Url,
        reputation_score: u16, // 300-850 scale
        social_score: u16,
        developer_score: u16,
        defi_score: u16,
        level: u8, // 1-100 based on reputation
        badge_count: u16,
        created_at: u64,
        updated_at: u64,
    }

    /// Social connection record
    struct SocialConnection has store, copy, drop {
        platform: String, // github, twitter, linkedin, discord
        username: String,
        verified: bool,
        connected_at: u64,
    }

    /// Achievement badge
    struct Badge has store, copy, drop {
        badge_id: String,
        name: String,
        description: String,
        badge_type: String, // social, defi, developer, milestone
        earned_at: u64,
    }

    /// NFT Collection capability for admin functions
    struct AdminCap has key, store {
        id: UID,
    }

    // ===== Events =====

    struct NFTMinted has copy, drop {
        id: address,
        owner: address,
        name: String,
        reputation_score: u16,
        timestamp: u64,
    }

    struct ReputationUpdated has copy, drop {
        id: address,
        owner: address,
        old_score: u16,
        new_score: u16,
        timestamp: u64,
    }

    struct SocialConnectionAdded has copy, drop {
        id: address,
        owner: address,
        platform: String,
        username: String,
        timestamp: u64,
    }

    struct BadgeEarned has copy, drop {
        id: address,
        owner: address,
        badge_id: String,
        badge_name: String,
        timestamp: u64,
    }

    struct NFTTransferred has copy, drop {
        id: address,
        old_owner: address,
        new_owner: address,
        timestamp: u64,
    }

    // ===== Module Initializer =====

    /// Module initializer - creates admin capability
    fun init(witness: IDENTITY_NFT, ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        
        // Transfer admin capability to the deployer
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // ===== Public Functions =====

    /// Mint a new Identity NFT
    public fun mint_identity_nft(
        admin_cap: &AdminCap,
        recipient: address,
        name: String,
        description: String,
        image_url: vector<u8>,
        metadata_url: vector<u8>,
        initial_reputation: u16,
        clock: &Clock,
        ctx: &mut TxContext
    ): IdentityNFT {
        // Validate inputs
        assert!(initial_reputation >= 300 && initial_reputation <= 850, EInvalidReputationScore);
        assert!(vector::length(&image_url) > 0, EInvalidMetadataUrl);
        assert!(vector::length(&metadata_url) > 0, EInvalidMetadataUrl);

        let current_time = clock::timestamp_ms(clock);
        let level = calculate_level(initial_reputation);

        let nft = IdentityNFT {
            id: object::new(ctx),
            owner: recipient,
            name,
            description,
            image_url: url::new_unsafe_from_bytes(image_url),
            metadata_url: url::new_unsafe_from_bytes(metadata_url),
            reputation_score: initial_reputation,
            social_score: 0,
            developer_score: 0,
            defi_score: 0,
            level,
            badge_count: 0,
            created_at: current_time,
            updated_at: current_time,
        };

        // Emit minting event
        event::emit(NFTMinted {
            id: object::uid_to_address(&nft.id),
            owner: recipient,
            name: nft.name,
            reputation_score: initial_reputation,
            timestamp: current_time,
        });

        nft
    }

    /// Update reputation score and metadata
    public fun update_reputation(
        nft: &mut IdentityNFT,
        admin_cap: &AdminCap,
        new_reputation: u16,
        new_social_score: u16,
        new_developer_score: u16,
        new_defi_score: u16,
        new_metadata_url: vector<u8>,
        clock: &Clock,
    ) {
        assert!(new_reputation >= 300 && new_reputation <= 850, EInvalidReputationScore);
        assert!(vector::length(&new_metadata_url) > 0, EInvalidMetadataUrl);

        let old_score = nft.reputation_score;
        let current_time = clock::timestamp_ms(clock);
        
        nft.reputation_score = new_reputation;
        nft.social_score = new_social_score;
        nft.developer_score = new_developer_score;
        nft.defi_score = new_defi_score;
        nft.level = calculate_level(new_reputation);
        nft.metadata_url = url::new_unsafe_from_bytes(new_metadata_url);
        nft.updated_at = current_time;

        // Emit reputation update event
        event::emit(ReputationUpdated {
            id: object::uid_to_address(&nft.id),
            owner: nft.owner,
            old_score,
            new_score: new_reputation,
            timestamp: current_time,
        });
    }

    /// Add a social connection to the NFT
    public fun add_social_connection(
        nft: &mut IdentityNFT,
        admin_cap: &AdminCap,
        platform: String,
        username: String,
        verified: bool,
        clock: &Clock,
    ) {
        let current_time = clock::timestamp_ms(clock);
        
        let connection = SocialConnection {
            platform: platform,
            username: username,
            verified,
            connected_at: current_time,
        };

        // Store in dynamic field using platform as key
        dynamic_field::add(&mut nft.id, platform, connection);

        // Emit social connection event
        event::emit(SocialConnectionAdded {
            id: object::uid_to_address(&nft.id),
            owner: nft.owner,
            platform,
            username,
            timestamp: current_time,
        });
    }

    /// Award a badge to the NFT
    public fun award_badge(
        nft: &mut IdentityNFT,
        admin_cap: &AdminCap,
        badge_id: String,
        name: String,
        description: String,
        badge_type: String,
        clock: &Clock,
    ) {
        let current_time = clock::timestamp_ms(clock);
        
        let badge = Badge {
            badge_id,
            name,
            description,
            badge_type,
            earned_at: current_time,
        };

        // Store badge in dynamic field
        dynamic_field::add(&mut nft.id, badge_id, badge);
        nft.badge_count = nft.badge_count + 1;
        nft.updated_at = current_time;

        // Emit badge earned event
        event::emit(BadgeEarned {
            id: object::uid_to_address(&nft.id),
            owner: nft.owner,
            badge_id,
            badge_name: name,
            timestamp: current_time,
        });
    }

    /// Transfer the NFT to a new owner
    public fun transfer_nft(
        nft: IdentityNFT,
        new_owner: address,
        clock: &Clock,
    ) {
        assert!(nft.owner != new_owner, ESameOwner);
        
        let old_owner = nft.owner;
        let current_time = clock::timestamp_ms(clock);

        // Emit transfer event
        event::emit(NFTTransferred {
            id: object::uid_to_address(&nft.id),
            old_owner,
            new_owner,
            timestamp: current_time,
        });

        // Transfer the NFT
        transfer::transfer(nft, new_owner);
    }

    // ===== View Functions =====

    /// Get NFT basic information
    public fun get_nft_info(nft: &IdentityNFT): (
        address, // owner
        String,  // name
        String,  // description
        u16,     // reputation_score
        u16,     // social_score
        u16,     // developer_score
        u16,     // defi_score
        u8,      // level
        u16,     // badge_count
        u64,     // created_at
        u64,     // updated_at
    ) {
        (
            nft.owner,
            nft.name,
            nft.description,
            nft.reputation_score,
            nft.social_score,
            nft.developer_score,
            nft.defi_score,
            nft.level,
            nft.badge_count,
            nft.created_at,
            nft.updated_at,
        )
    }

    /// Get NFT URLs
    public fun get_nft_urls(nft: &IdentityNFT): (Url, Url) {
        (nft.image_url, nft.metadata_url)
    }

    /// Check if social connection exists
    public fun has_social_connection(nft: &IdentityNFT, platform: String): bool {
        dynamic_field::exists_(&nft.id, platform)
    }

    /// Get social connection details
    public fun get_social_connection(nft: &IdentityNFT, platform: String): (String, bool, u64) {
        let connection: &SocialConnection = dynamic_field::borrow(&nft.id, platform);
        (connection.username, connection.verified, connection.connected_at)
    }

    /// Check if badge exists
    public fun has_badge(nft: &IdentityNFT, badge_id: String): bool {
        dynamic_field::exists_(&nft.id, badge_id)
    }

    /// Get badge details
    public fun get_badge(nft: &IdentityNFT, badge_id: String): (String, String, String, u64) {
        let badge: &Badge = dynamic_field::borrow(&nft.id, badge_id);
        (badge.name, badge.description, badge.badge_type, badge.earned_at)
    }

    // ===== Helper Functions =====

    /// Calculate level based on reputation score
    fun calculate_level(reputation: u16): u8 {
        if (reputation >= 800) {
            100 // Max level for 800+ reputation
        } else if (reputation >= 700) {
            80 + ((reputation - 700) / 10) as u8
        } else if (reputation >= 600) {
            60 + ((reputation - 600) / 5) as u8
        } else if (reputation >= 500) {
            40 + ((reputation - 500) / 5) as u8
        } else if (reputation >= 400) {
            20 + ((reputation - 400) / 5) as u8
        } else {
            1 + ((reputation - 300) / 10) as u8
        }
    }

    // ===== Admin Functions =====

    /// Create additional admin capabilities (only by existing admin)
    public fun create_admin_cap(
        _admin_cap: &AdminCap,
        ctx: &mut TxContext
    ): AdminCap {
        AdminCap {
            id: object::new(ctx),
        }
    }

    /// Destroy admin capability
    public fun destroy_admin_cap(admin_cap: AdminCap) {
        let AdminCap { id } = admin_cap;
        object::delete(id);
    }

    // ===== Test Functions =====

    #[test_only]
    use sui::test_scenario;
    #[test_only]
    use sui::clock;

    #[test]
    fun test_mint_and_update_nft() {
        let admin = @0x1;
        let user = @0x2;
        
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        
        // Initialize module
        {
            let ctx = test_scenario::ctx(scenario);
            init(IDENTITY_NFT {}, ctx);
        };

        // Mint NFT
        test_scenario::next_tx(scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            let ctx = test_scenario::ctx(scenario);
            
            let nft = mint_identity_nft(
                &admin_cap,
                user,
                string::utf8(b"Test User"),
                string::utf8(b"A test user identity"),
                b"https://example.com/image.png",
                b"https://example.com/metadata.json",
                350,
                &clock,
                ctx
            );
            
            transfer::transfer(nft, user);
            test_scenario::return_to_sender(scenario, admin_cap);
            clock::destroy_for_testing(clock);
        };

        // Update reputation
        test_scenario::next_tx(scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            
            test_scenario::next_tx(scenario, user);
            let nft = test_scenario::take_from_sender<IdentityNFT>(scenario);
            
            update_reputation(
                &mut nft,
                &admin_cap,
                500,
                100,
                200,
                200,
                b"https://example.com/updated_metadata.json",
                &clock,
            );

            let (_, _, _, reputation, _, _, _, level, _, _, _) = get_nft_info(&nft);
            assert!(reputation == 500, 0);
            assert!(level > 1, 1);
            
            test_scenario::return_to_sender(scenario, nft);
            test_scenario::return_to_sender(scenario, admin_cap);
            clock::destroy_for_testing(clock);
        };

        test_scenario::end(scenario_val);
    }
}