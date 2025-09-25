import { Transaction } from '@mysten/sui/transactions'
import { suiClient } from '../core/sui'
import { SuiObjectResponse } from '@mysten/sui/client'

// Contract configuration for reputation NFT v2
export const CONTRACT_CONFIG = {
  packageId: process.env.NEXT_PUBLIC_PACKAGE_ID || '',
  modules: {
    reputationNft: 'reputation_nft',
    questSystem: 'quest_system'
  }
} as const

// Type definitions for reputation NFT contract
export interface ReputationCardData {
  id: string
  owner: string
  name: string
  profile_image: string
  description: string
  reputation_score: number
  tags: string[]
  social_links: Record<string, string>
  verifications: SocialVerification[]
  created_at: number
  updated_at: number
}

export interface SocialVerification {
  platform: string
  username: string
  verification_data: string
  verified_at: number
}

export interface UpgradeTicketData {
  id: string
  ticket_type: string
  benefits: string[]
  expires_at: number | null
  used: boolean
  created_at: number
}

export interface QuestData {
  id: string
  title: string
  description: string
  questType: string
  xpReward: number
  suiReward: number
  requirements: string[]
  isActive: boolean
  createdAt: number
}

export interface UserProgressData {
  id: string
  user: string
  totalXp: number
  level: number
  completedQuests: string[]
  currentStreak: number
  longestStreak: number
  lastActivity: number
}

export interface SocialConnection {
  platform: string
  username: string
  verified: boolean
  connectedAt: number
}

export interface Badge {
  badgeId: string
  name: string
  description: string
  badgeType: string
  earnedAt: number
}

// Smart contract interaction functions
export class SuiDentityContracts {
  private packageId: string

  constructor(packageId?: string) {
    this.packageId = packageId || CONTRACT_CONFIG.packageId
    if (!this.packageId) {
      console.warn('⚠️ Package ID not configured. Smart contract functions will not work.')
    }
  }

  /**
   * Get the card registry object ID (will be set after deployment)
   */
  private getRegistryId(): string {
    // This should be set after contract deployment
    return process.env.NEXT_PUBLIC_REGISTRY_ID || '0x0'
  }

  // ===== Reputation NFT Functions =====

  /**
   * Create a transaction to mint a Reputation Card (user self-minting)
   */
  mintReputationCard(
    name: string,
    profileImage: string,
    description: string,
    initialTags: string[],
    initialSocialLinks: Record<string, string>
  ): Transaction {
    const tx = new Transaction()

    // Convert social links to VecMap format
    const socialLinksKeys = Object.keys(initialSocialLinks)
    const socialLinksValues = Object.values(initialSocialLinks)

    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_CONFIG.modules.reputationNft}::mint_reputation_card`,
      arguments: [
        tx.pure.string(name),
        tx.pure.string(profileImage),
        tx.pure.string(description),
        tx.pure.vector('string', initialTags),
        tx.pure.vector('string', socialLinksKeys),
        tx.pure.vector('string', socialLinksValues),
        tx.sharedObjectRef({
          objectId: '0x6', // Clock object
          initialSharedVersion: '1',
          mutable: true
        }),
        tx.object(this.getRegistryId()) // Card registry
      ]
    })

    return tx
  }

  /**
   * Create a transaction to update own card metadata
   */
  updateOwnCardMetadata(
    cardId: string,
    newName?: string,
    newProfileImage?: string,
    newDescription?: string,
    newTags?: string[]
  ): Transaction {
    const tx = new Transaction()

    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_CONFIG.modules.reputationNft}::update_own_card_metadata`,
      arguments: [
        tx.object(cardId),
        tx.pure.option('string', newName || null),
        tx.pure.option('string', newProfileImage || null),
        tx.pure.option('string', newDescription || null),
        tx.pure.option('vector<string>', newTags || null),
        tx.sharedObjectRef({
          objectId: '0x6', // Clock object
          initialSharedVersion: '1',
          mutable: true
        })
      ]
    })

    return tx
  }

  /**
   * Create a transaction to add social verification
   */
  addSocialVerification(
    cardId: string,
    platform: string,
    username: string,
    verificationData: string
  ): Transaction {
    const tx = new Transaction()

    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_CONFIG.modules.reputationNft}::add_social_verification`,
      arguments: [
        tx.object(cardId),
        tx.pure.string(platform),
        tx.pure.string(username),
        tx.pure.string(verificationData),
        tx.sharedObjectRef({
          objectId: '0x6', // Clock object
          initialSharedVersion: '1',
          mutable: true
        })
      ]
    })

    return tx
  }

  /**
   * Create a transaction to apply upgrade ticket to card
   */
  applyUpgradeTicket(
    cardId: string,
    ticketId: string
  ): Transaction {
    const tx = new Transaction()

    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_CONFIG.modules.reputationNft}::apply_upgrade_ticket`,
      arguments: [
        tx.object(cardId),
        tx.object(ticketId),
        tx.sharedObjectRef({
          objectId: '0x6', // Clock object
          initialSharedVersion: '1',
          mutable: true
        })
      ]
    })

    return tx
  }

  /**
   * Create a transaction to create upgrade ticket (admin only)
   */
  createUpgradeTicket(
    recipient: string,
    ticketType: string,
    benefits: string[],
    expiresAt?: number
  ): Transaction {
    const tx = new Transaction()

    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_CONFIG.modules.reputationNft}::create_upgrade_ticket`,
      arguments: [
        tx.object(this.getAdminCapId()), // Admin capability
        tx.pure.address(recipient),
        tx.pure.string(ticketType),
        tx.pure.vector('string', benefits),
        tx.pure.option('u64', expiresAt || null),
        tx.sharedObjectRef({
          objectId: '0x6', // Clock object
          initialSharedVersion: '1',
          mutable: true
        })
      ]
    })

    return tx
  }

  /**
   * Get the admin capability object ID (will be set after deployment)
   */
  private getAdminCapId(): string {
    return process.env.NEXT_PUBLIC_ADMIN_CAP_ID || '0x0'
  }

  // ===== Quest System Functions =====

  /**
   * Create a transaction to complete a quest
   */
  completeQuest(
    questId: string,
    userProgressId: string,
    rewardPoolId: string
  ): Transaction {
    const tx = new Transaction()

    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_CONFIG.modules.questSystem}::complete_quest`,
      arguments: [
        tx.object(questId),
        tx.object(userProgressId),
        tx.object(rewardPoolId),
        tx.sharedObjectRef({
          objectId: '0x6', // Clock object
          initialSharedVersion: '1',
          mutable: true
        })
      ]
    })

    return tx
  }

  /**
   * Create a transaction to initialize user progress
   */
  createUserProgress(userAddress: string): Transaction {
    const tx = new Transaction()

    tx.moveCall({
      target: `${this.packageId}::${CONTRACT_CONFIG.modules.questSystem}::create_user_progress`,
      arguments: [
        tx.pure.address(userAddress),
        tx.sharedObjectRef({
          objectId: '0x6', // Clock object
          initialSharedVersion: '1',
          mutable: true
        })
      ]
    })

    return tx
  }

  // ===== View Functions =====

  /**
   * Get Reputation Card data
   */
  async getReputationCard(cardId: string): Promise<ReputationCardData | null> {
    try {
      const response: SuiObjectResponse = await suiClient.getObject({
        id: cardId,
        options: {
          showContent: true,
          showType: true
        }
      })

      if (!response.data?.content || response.data.content.dataType !== 'moveObject') {
        return null
      }

      const fields = response.data.content.fields as any
      
      // Parse social links from VecMap
      const socialLinks: Record<string, string> = {}
      if (fields.social_links?.fields?.contents) {
        for (const entry of fields.social_links.fields.contents) {
          socialLinks[entry.fields.key] = entry.fields.value
        }
      }

      // Parse verifications
      const verifications: SocialVerification[] = []
      if (fields.verifications) {
        for (const verification of fields.verifications) {
          verifications.push({
            platform: verification.fields.platform,
            username: verification.fields.username,
            verification_data: verification.fields.verification_data,
            verified_at: parseInt(verification.fields.verified_at)
          })
        }
      }
      
      return {
        id: cardId,
        owner: fields.id.id,
        name: fields.name,
        profile_image: fields.profile_image,
        description: fields.description,
        reputation_score: parseInt(fields.reputation_score),
        tags: fields.tags || [],
        social_links: socialLinks,
        verifications,
        created_at: parseInt(fields.created_at),
        updated_at: parseInt(fields.updated_at)
      }
    } catch (error) {
      console.error('Error fetching Reputation Card:', error)
      return null
    }
  }

  /**
   * Get user's Reputation Cards
   */
  async getUserReputationCards(ownerAddress: string): Promise<ReputationCardData[]> {
    try {
      // Validate inputs
      if (!ownerAddress) {
        console.warn('❌ Invalid owner address provided to getUserReputationCards')
        return []
      }
      
      if (!this.packageId) {
        console.warn('❌ Package ID not configured, skipping NFT check')
        return []
      }

      const response = await suiClient.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${this.packageId}::${CONTRACT_CONFIG.modules.reputationNft}::ReputationCard`
        },
        options: {
          showContent: true,
          showType: true
        }
      })

      const cards: ReputationCardData[] = []
      
      for (const item of response.data) {
        if (item.data?.content && item.data.content.dataType === 'moveObject') {
          const fields = item.data.content.fields as any
          
          // Parse social links from VecMap
          const socialLinks: Record<string, string> = {}
          if (fields.social_links?.fields?.contents) {
            for (const entry of fields.social_links.fields.contents) {
              socialLinks[entry.fields.key] = entry.fields.value
            }
          }

          // Parse verifications
          const verifications: SocialVerification[] = []
          if (fields.verifications) {
            for (const verification of fields.verifications) {
              verifications.push({
                platform: verification.fields.platform,
                username: verification.fields.username,
                verification_data: verification.fields.verification_data,
                verified_at: parseInt(verification.fields.verified_at)
              })
            }
          }

          cards.push({
            id: item.data.objectId,
            owner: fields.id.id,
            name: fields.name,
            profile_image: fields.profile_image,
            description: fields.description,
            reputation_score: parseInt(fields.reputation_score),
            tags: fields.tags || [],
            social_links: socialLinks,
            verifications,
            created_at: parseInt(fields.created_at),
            updated_at: parseInt(fields.updated_at)
          })
        }
      }

      return cards
    } catch (error) {
      console.error('Error fetching user Reputation Cards:', error)
      return []
    }
  }

  /**
   * Get user's Upgrade Tickets
   */
  async getUserUpgradeTickets(ownerAddress: string): Promise<UpgradeTicketData[]> {
    try {
      const response = await suiClient.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${this.packageId}::${CONTRACT_CONFIG.modules.reputationNft}::UpgradeTicket`
        },
        options: {
          showContent: true,
          showType: true
        }
      })

      const tickets: UpgradeTicketData[] = []
      
      for (const item of response.data) {
        if (item.data?.content && item.data.content.dataType === 'moveObject') {
          const fields = item.data.content.fields as any
          
          tickets.push({
            id: item.data.objectId,
            ticket_type: fields.ticket_type,
            benefits: fields.benefits || [],
            expires_at: fields.expires_at ? parseInt(fields.expires_at) : null,
            used: fields.used,
            created_at: parseInt(fields.created_at)
          })
        }
      }

      return tickets
    } catch (error) {
      console.error('Error fetching user Upgrade Tickets:', error)
      return []
    }
  }

  /**
   * Get quest data
   */
  async getQuest(questId: string): Promise<QuestData | null> {
    try {
      const response: SuiObjectResponse = await suiClient.getObject({
        id: questId,
        options: {
          showContent: true
        }
      })

      if (!response.data?.content || response.data.content.dataType !== 'moveObject') {
        return null
      }

      const fields = response.data.content.fields as any
      
      return {
        id: questId,
        title: fields.title,
        description: fields.description,
        questType: fields.quest_type,
        xpReward: parseInt(fields.xp_reward),
        suiReward: parseInt(fields.sui_reward),
        requirements: fields.requirements || [],
        isActive: fields.is_active,
        createdAt: parseInt(fields.created_at)
      }
    } catch (error) {
      console.error('Error fetching quest:', error)
      return null
    }
  }

  /**
   * Get user progress data
   */
  async getUserProgress(progressId: string): Promise<UserProgressData | null> {
    try {
      const response: SuiObjectResponse = await suiClient.getObject({
        id: progressId,
        options: {
          showContent: true
        }
      })

      if (!response.data?.content || response.data.content.dataType !== 'moveObject') {
        return null
      }

      const fields = response.data.content.fields as any
      
      return {
        id: progressId,
        user: fields.user,
        totalXp: parseInt(fields.total_xp),
        level: parseInt(fields.level),
        completedQuests: fields.completed_quests || [],
        currentStreak: parseInt(fields.current_streak),
        longestStreak: parseInt(fields.longest_streak),
        lastActivity: parseInt(fields.last_activity)
      }
    } catch (error) {
      console.error('Error fetching user progress:', error)
      return null
    }
  }

  // ===== Utility Functions =====

  /**
   * Check if smart contracts are configured
   */
  isConfigured(): boolean {
    return !!this.packageId && this.packageId !== ''
  }

  /**
   * Get contract addresses for debugging
   */
  getContractInfo() {
    return {
      packageId: this.packageId,
      modules: CONTRACT_CONFIG.modules,
      configured: this.isConfigured()
    }
  }
}

// Export singleton instance
export const suiDentityContracts = new SuiDentityContracts()

// Helper functions for common operations
export async function mintUserReputationCard(
  name: string,
  profileImage: string,
  description: string = 'SuiDentity Reputation Card',
  initialTags: string[] = [],
  initialSocialLinks: Record<string, string> = {},
  signAndExecute: (tx: Transaction) => Promise<any>
): Promise<{ success: boolean; cardId?: string; error?: string }> {
  try {
    if (!suiDentityContracts.isConfigured()) {
      return {
        success: false,
        error: 'Smart contracts not configured. Please deploy contracts first.'
      }
    }

    const tx = suiDentityContracts.mintReputationCard(
      name,
      profileImage,
      description,
      initialTags,
      initialSocialLinks
    )

    const result = await signAndExecute(tx)

    // Extract card ID from transaction results
    const cardId = result.effects?.created?.[0]?.reference?.objectId

    return {
      success: true,
      cardId
    }
  } catch (error) {
    console.error('Error minting Reputation Card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Check if user already has a reputation card
export async function userHasReputationCard(userAddress: string): Promise<boolean> {
  try {
    const cards = await suiDentityContracts.getUserReputationCards(userAddress)
    return cards.length > 0
  } catch (error) {
    console.error('Error checking user reputation cards:', error)
    return false
  }
}

export default suiDentityContracts