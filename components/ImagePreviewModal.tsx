'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ImagePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  alt: string
}

export function ImagePreviewModal({ isOpen, onClose, imageUrl, alt }: ImagePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-gray-100 border-none shadow-none">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-[80vh] object-contain p-4"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/80 hover:bg-white/60 rounded-full h-10 w-10 shadow-md"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
