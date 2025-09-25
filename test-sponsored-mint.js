#!/usr/bin/env node

// Test script for sponsored NFT minting
const testSponsoredMint = async () => {
  try {
    console.log('Testing sponsored NFT minting...\n')

    // Test data
    const testData = {
      name: 'Test User Profile',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test123',
      description: 'Test SuiDentity Reputation Card',
      userAddress: '0x9a69456c5872ff996d138e066457c2f22b239a706bc7a30c186f0ff9d6ef3a77', // Admin address for testing
      userContext: {
        id: 'test-user-123',
        wallet_address: '0x9a69456c5872ff996d138e066457c2f22b239a706bc7a30c186f0ff9d6ef3a77',
        username: 'testuser',
        email: 'test@example.com'
      }
    }

    console.log('Request data:', JSON.stringify(testData, null, 2))
    console.log('\nMaking request to API...\n')

    const response = await fetch('http://localhost:3000/api/nft/mint-sponsored', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const responseText = await response.text()
    
    if (response.ok) {
      const data = JSON.parse(responseText)
      console.log('✅ SUCCESS! NFT minted successfully\n')
      console.log('Response:', JSON.stringify(data, null, 2))
      
      if (data.data?.transaction_digest) {
        console.log('\n🔗 View transaction on explorer:')
        console.log(`https://suiexplorer.com/txblock/${data.data.transaction_digest}?network=testnet`)
      }
      
      if (data.data?.nft_id) {
        console.log('\n🎨 NFT Object ID:', data.data.nft_id)
        console.log(`View NFT: https://suiexplorer.com/object/${data.data.nft_id}?network=testnet`)
      }
    } else {
      console.error('❌ ERROR:', response.status, response.statusText)
      
      try {
        const errorData = JSON.parse(responseText)
        console.error('Error details:', JSON.stringify(errorData, null, 2))
      } catch {
        console.error('Raw error:', responseText)
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error)
  }
}

// Run the test
testSponsoredMint()