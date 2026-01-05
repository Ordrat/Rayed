// Driver Types based on API specification

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  vehicleType: VehicleType;
  deliveryAccountStatus: DeliveryAccountStatus;
  deliveryAvailabilityStatus: DeliveryAvailabilityStatus;
  currentLatitude: number;
  currentLongitude: number;
  lastLocationUpdateAt: string;
  totalDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  verifiedAt: string | null;
  createdAt: string;
}

export interface RegisterDriverRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  vehicleType: VehicleType;
}

export interface UpdateDriverRequest {
  driverId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  vehicleType: VehicleType;
}

export interface ChangeDriverAccountStatusRequest {
  driverId: string;
  deliveryAccountStatus: DeliveryAccountStatus;
}

export interface DriverDocument {
  id: string;
  driverId: string;
  documentType: DriverDocumentType;
  documentUrl: string;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason: string | null;
  expiresAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeDocumentStatusRequest {
  documentId: string;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason?: string;
}

// Enums
export enum VehicleType {
  MOTORCYCLE = 0,
  CAR = 1,
  BICYCLE = 2,
  VAN = 3,
}

export enum DeliveryAccountStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  SUSPENDED = 3,
}

export enum DeliveryAvailabilityStatus {
  OFFLINE = 0,
  AVAILABLE = 1,
  BUSY = 2,
}

export enum DriverDocumentType {
  NATIONAL_ID = 0,
  DRIVERS_LICENSE = 1,
  VEHICLE_REGISTRATION = 2,
  INSURANCE = 3,
}

export enum DocumentVerificationStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

// Helper functions
export function getVehicleTypeLabel(type: VehicleType): string {
  switch (type) {
    case VehicleType.MOTORCYCLE:
      return "Motorcycle";
    case VehicleType.CAR:
      return "Car";
    case VehicleType.BICYCLE:
      return "Bicycle";
    case VehicleType.VAN:
      return "Van";
    default:
      return "Unknown";
  }
}

export function getDeliveryAccountStatusLabel(status: DeliveryAccountStatus): string {
  switch (status) {
    case DeliveryAccountStatus.PENDING:
      return "Pending";
    case DeliveryAccountStatus.APPROVED:
      return "Approved";
    case DeliveryAccountStatus.REJECTED:
      return "Rejected";
    case DeliveryAccountStatus.SUSPENDED:
      return "Suspended";
    default:
      return "Unknown";
  }
}

export function getDeliveryAvailabilityStatusLabel(status: DeliveryAvailabilityStatus): string {
  switch (status) {
    case DeliveryAvailabilityStatus.OFFLINE:
      return "Offline";
    case DeliveryAvailabilityStatus.AVAILABLE:
      return "Available";
    case DeliveryAvailabilityStatus.BUSY:
      return "Busy";
    default:
      return "Unknown";
  }
}

export function getDriverDocumentTypeLabel(type: DriverDocumentType): string {
  switch (type) {
    case DriverDocumentType.NATIONAL_ID:
      return "National ID";
    case DriverDocumentType.DRIVERS_LICENSE:
      return "Driver's License";
    case DriverDocumentType.VEHICLE_REGISTRATION:
      return "Vehicle Registration";
    case DriverDocumentType.INSURANCE:
      return "Insurance";
    default:
      return "Unknown";
  }
}

export function getDocumentVerificationStatusLabel(status: DocumentVerificationStatus): string {
  switch (status) {
    case DocumentVerificationStatus.PENDING:
      return "Pending";
    case DocumentVerificationStatus.APPROVED:
      return "Approved";
    case DocumentVerificationStatus.REJECTED:
      return "Rejected";
    default:
      return "Unknown";
  }
}
