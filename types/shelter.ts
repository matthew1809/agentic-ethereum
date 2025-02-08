export interface Animal {
    id: string;
    species: 'dog' | 'cat';
    breed: string;
    age: number;
    status: 'available' | 'adopted' | 'pending';
    intake_date: string;
    temperament: ('friendly' | 'shy' | 'energetic' | 'calm' | 'good_with_kids' | 'good_with_pets')[];
    medical_issues: {
        has_issues: boolean;
        description?: string;
    };
    space_requirements: {
        min_space: 'apartment' | 'house' | 'garden' | 'farm';
        needs_garden: boolean;
        floor_restrictions?: boolean; // true means ground floor needed
    };
    additional_notes?: string;
}

export interface ShelterFetched {
    _id: string;
    shelter_info: {
        name: {
            $share: string;
        };
        location: {
            $share: string;
        };
        operational_costs: {
            $share: number;
        };
    };
    metrics: {
        current_animals: number;
        monthly_intake: number;
        neutering_count: number;
        adoption_rate: number;
    };
    animals: Animal[];
}

export interface ShelterUpload {
    _id: string;
    shelter_info: {
        name: {
            $allot: string;
        };
        location: {
            $allot: string;
        };
        operational_costs: {
            $allot: number;
        };
    };
    metrics: {
        current_animals: number;
        monthly_intake: number;
        neutering_count: number;
        adoption_rate: number;
    };
    animals: Animal[];
}

export interface TwitterCredentials {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
}

export interface ShelterFetched {
    name: { $allot: string };
    location: { $allot: string };
    operational_costs: { $allot: number };
}

export interface ShelterMetrics {
    current_animals: number;
    monthly_intake: number;
    neutering_count: number;
    adoption_rate: number;
} 