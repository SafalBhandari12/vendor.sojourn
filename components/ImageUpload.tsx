"use client";

import { useState, useRef } from "react";
import { Button, Input, Label } from "@/components/ui";
import Image from "next/image";

interface ImageUploadProps {
  onImagesChange: (
    images: File[],
    descriptions: string[],
    isPrimary: boolean[]
  ) => void;
  maxImages?: number;
  existingImages?: Array<{
    id: string;
    imageUrl: string;
    description: string;
    isPrimary: boolean;
  }>;
  onDeleteExisting?: (imageId: string) => void;
}

interface ImagePreview {
  file: File;
  preview: string;
  description: string;
  isPrimary: boolean;
}

export function ImageUpload({
  onImagesChange,
  maxImages = 5,
  existingImages = [],
  onDeleteExisting,
}: ImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      description: `Image ${images.length + index + 1}`,
      isPrimary:
        images.length === 0 && index === 0 && existingImages.length === 0,
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);

    // Notify parent component
    notifyParent(updatedImages);
  };

  const notifyParent = (imageList: ImagePreview[]) => {
    const files = imageList.map((img) => img.file);
    const descriptions = imageList.map((img) => img.description);
    const isPrimary = imageList.map((img) => img.isPrimary);
    onImagesChange(files, descriptions, isPrimary);
  };

  const updateImageDescription = (index: number, description: string) => {
    const updatedImages = images.map((img, i) =>
      i === index ? { ...img, description } : img
    );
    setImages(updatedImages);
    notifyParent(updatedImages);
  };

  const setPrimaryImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(updatedImages);
    notifyParent(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);

    // If we removed the primary image, make the first one primary
    if (
      updatedImages.length > 0 &&
      !updatedImages.some((img) => img.isPrimary)
    ) {
      updatedImages[0].isPrimary = true;
    }

    setImages(updatedImages);
    notifyParent(updatedImages);

    // Clean up preview URL
    URL.revokeObjectURL(images[index].preview);
  };

  const hasPrimaryImage =
    existingImages.some((img) => img.isPrimary) ||
    images.some((img) => img.isPrimary);

  return (
    <div className='space-y-4'>
      <div>
        <Label htmlFor='image-upload'>Upload Room Images</Label>
        <input
          id='image-upload'
          ref={fileInputRef}
          type='file'
          multiple
          accept='image/*'
          onChange={handleFileSelect}
          className='mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        />
        <p className='text-sm text-gray-500 mt-1'>
          Upload high-quality images of the room. Maximum {maxImages} images
          allowed.
        </p>
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <Label>Existing Images</Label>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-2'>
            {existingImages.map((image) => (
              <div key={image.id} className='relative group'>
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  width={200}
                  height={150}
                  className='w-full h-32 object-cover rounded-lg'
                />

                {image.isPrimary && (
                  <div className='absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs'>
                    Primary
                  </div>
                )}

                <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center'>
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => onDeleteExisting?.(image.id)}
                  >
                    Delete
                  </Button>
                </div>

                <div className='mt-2'>
                  <Input
                    value={image.description}
                    onChange={() => {}} // Read-only for existing images
                    placeholder='Image description'
                    className='text-sm'
                    disabled
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images Preview */}
      {images.length > 0 && (
        <div>
          <Label>New Images</Label>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-2'>
            {images.map((image, index) => (
              <div key={index} className='relative group'>
                <Image
                  src={image.preview}
                  alt={image.description}
                  width={200}
                  height={150}
                  className='w-full h-32 object-cover rounded-lg'
                />

                {image.isPrimary && (
                  <div className='absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs'>
                    Primary
                  </div>
                )}

                <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2'>
                  {!hasPrimaryImage && (
                    <Button size='sm' onClick={() => setPrimaryImage(index)}>
                      Set Primary
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => removeImage(index)}
                  >
                    Remove
                  </Button>
                </div>

                <div className='mt-2'>
                  <Input
                    value={image.description}
                    onChange={(e) =>
                      updateImageDescription(index, e.target.value)
                    }
                    placeholder='Image description'
                    className='text-sm'
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add More Images Button */}
      {images.length + existingImages.length < maxImages && (
        <Button
          type='button'
          variant='outline'
          onClick={() => fileInputRef.current?.click()}
          className='w-full'
        >
          Add More Images ({images.length + existingImages.length}/{maxImages})
        </Button>
      )}
    </div>
  );
}
