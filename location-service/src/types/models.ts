// src/types/models.ts
export interface Location {
    id: string;
    name: string;
    address: string;
    coordinates: any; // PostGIS Point
    type: string;
    category?: string;
    description?: string;
    contacts?: any;
    workingHours?: any;
    createdBy: string;
    organizationId?: string;
    status: string;
    overallAccessibilityScore?: number;
    createdAt: Date;
    updatedAt: Date;
    lastVerifiedAt?: Date;
    rejectionReason?: string;
    features?: AccessibilityFeature[];
    photos?: Photo[];
    verifications?: Verification[];
    reviews?: Review[];
  }
  
  export interface AccessibilityFeature {
    id: string;
    locationId: string;
    type: string;
    subtype?: string;
    description?: string;
    status: boolean;
    qualityRating?: number;
    standardsCompliance?: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    location?: Location;
    photos?: Photo[];
    verifications?: Verification[];
  }
  
  export interface Photo {
    id: string;
    locationId: string;
    featureId?: string;
    url: string;
    thumbnailUrl: string;
    description?: string;
    createdBy: string;
    moderationStatus: string;
    aiModerationScore?: number;
    aiAccessibilityDetection?: any;
    createdAt: Date;
    rejectReason?: string;
    metadata?: any;
    location?: Location;
    feature?: AccessibilityFeature;
  }
  
  export interface Verification {
    id: string;
    locationId: string;
    featureId?: string;
    verifiedBy: string;
    organizationId?: string;
    status: boolean;
    comment?: string;
    evidencePhotoId?: string;
    createdAt: Date;
    isOfficial: boolean;
    location?: Location;
    feature?: AccessibilityFeature;
    evidencePhoto?: Photo;
  }
  
  export interface Review {
    id: string;
    locationId: string;
    userId: string;
    rating: number;
    comment?: string;
    accessibilityExperience?: string;
    moderationStatus: string;
    createdAt: Date;
    updatedAt: Date;
    location?: Location;
  }