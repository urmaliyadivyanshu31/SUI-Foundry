'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

interface NFT {
  id: string
  name: string
  image_url: string | null
  collection_name: string
  network: 'mainnet' | 'testnet'
}

interface NFTGalleryProps {
  nfts: NFT[]
  totalNftCount: number
}

export function NFTGallery({ nfts, totalNftCount }: NFTGalleryProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)

  if (nfts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900/40 backdrop-blur border border-gray-700/50 rounded-xl p-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4">NFT Collection</h3>
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-400">No NFTs found in this wallet</p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-900/40 backdrop-blur border border-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">NFT Collection</h3>
          <Badge variant="secondary" className="bg-purple-900/30 border-purple-500/30 text-purple-300">
            {totalNftCount} NFTs
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
              onClick={() => setSelectedNFT(nft)}
            >
              <div className="aspect-square relative">
                {nft.image_url ? (
                  <Image
                    src={nft.image_url}
                    alt={`${nft.name} NFT from ${nft.collection_name} collection`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-gray-800/50">
                    <span className="text-2xl">🖼️</span>
                  </div>
                )}
                
                {/* Network Badge */}
                <Badge
                  variant={nft.network === 'mainnet' ? 'default' : 'secondary'}
                  className={`absolute top-2 right-2 text-xs ${
                    nft.network === 'mainnet' 
                      ? 'bg-green-900/80 border-green-500/50 text-green-300'
                      : 'bg-orange-900/80 border-orange-500/50 text-orange-300'
                  }`}
                >
                  {nft.network}
                </Badge>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="p-3">
                <h4 className="font-medium text-white text-sm truncate">{nft.name}</h4>
                <p className="text-xs text-gray-400 truncate">{nft.collection_name}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {totalNftCount > nfts.length && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Showing {nfts.length} of {totalNftCount} NFTs
            </p>
          </div>
        )}
      </motion.div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNFT(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900/95 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-square relative mb-4 rounded-lg overflow-hidden">
              {selectedNFT.image_url ? (
                <Image
                  src={selectedNFT.image_url}
                  alt={`${selectedNFT.name} NFT from ${selectedNFT.collection_name} collection`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-gray-800/50">
                  <span className="text-4xl">🖼️</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedNFT.name}</h3>
                <p className="text-gray-400">{selectedNFT.collection_name}</p>
              </div>

              <div className="flex items-center justify-between">
                <Badge
                  variant={selectedNFT.network === 'mainnet' ? 'default' : 'secondary'}
                  className={`${
                    selectedNFT.network === 'mainnet' 
                      ? 'bg-green-900/80 border-green-500/50 text-green-300'
                      : 'bg-orange-900/80 border-orange-500/50 text-orange-300'
                  }`}
                >
                  {selectedNFT.network}
                </Badge>

                <button
                  onClick={() => setSelectedNFT(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}