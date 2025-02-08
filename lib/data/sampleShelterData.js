export const sampleShelterData = [
    {
        _id: "ca4f1107-5918-467c-95c7-396a71bfe29e",
        shelter_info: {
            name: { $allot: 'Happy Paws Warsaw Shelter' },
            location: { $allot: 'ul. Zwierzeca 12, 00-001 Warsaw' },
            operational_costs: { $allot: 180000 }  // PLN
        },
        metrics: {
            current_animals: 5,
            monthly_intake: 12,
            neutering_count: 30,
            adoption_rate: 0.75
        },
        animals: [
            {
                id: "a1b2c3d4-e5f6-4711-8899-aabbccddeeff",
                species: "cat",
                breed: "British Shorthair",
                age: 1.5,
                status: "available",
                intake_date: "2024-02-03T12:00:00Z",
                temperament: ["friendly", "calm", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                },
                additional_notes: "Lovely lap cat, perfect for families"
            },
            {
                id: "b2c3d4e5-f6a7-4822-9900-bbccddeeaabb",
                species: "dog",
                breed: "Golden Retriever",
                age: 3,
                status: "available",
                intake_date: "2024-01-15T14:30:00Z",
                temperament: ["friendly", "energetic", "good_with_kids", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "house",
                    needs_garden: true,
                    floor_restrictions: false
                }
            },
            {
                id: "c2d3e4f5-1234-4933-0011-ccddeeaabbcc",
                species: "cat",
                breed: "Russian Blue",
                age: 4,
                status: "available",
                intake_date: "2024-02-20T10:00:00Z",
                temperament: ["calm", "shy", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                },
                additional_notes: "Quiet and gentle, perfect for a peaceful home"
            },
            {
                id: "d3e4f5a6-b7c8-4044-1122-ddeeffaabbcc",
                species: "dog",
                breed: "Poodle",
                age: 2,
                status: "available",
                intake_date: "2024-02-18T14:20:00Z",
                temperament: ["friendly", "energetic", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                },
                additional_notes: "Smart and hypoallergenic"
            },
            {
                id: "e4f5a6b7-c8d9-4155-2233-eeffaabbccdd",
                species: "cat",
                breed: "Domestic Longhair",
                age: 6,
                status: "available",
                intake_date: "2024-02-15T09:30:00Z",
                temperament: ["friendly", "calm", "good_with_kids", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            },
            {
                id: "f5a6b7c8-d9e0-4266-3344-ffaabbccddee",
                species: "dog",
                breed: "Shih Tzu",
                age: 5,
                status: "adopted",
                intake_date: "2024-01-20T11:45:00Z",
                temperament: ["friendly", "calm", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            }
        ]
    },
    {
        _id: "5af41250-e509-4833-98f3-387389257270",
        shelter_info: {
            name: { $allot: 'Krakow Animal Haven' },
            location: { $allot: 'ul. Adopcyjna 45, 30-001 Krakow' },
            operational_costs: { $allot: 220000 }
        },
        metrics: {
            current_animals: 6,
            monthly_intake: 15,
            neutering_count: 45,
            adoption_rate: 0.82
        },
        animals: [
            {
                id: "c3d4e5f6-a7b8-4933-0011-ccddeeffaabb",
                species: "dog",
                breed: "Border Collie",
                age: 2,
                status: "available",
                intake_date: "2024-02-15T09:00:00Z",
                temperament: ["energetic", "friendly", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "house",
                    needs_garden: true,
                    floor_restrictions: false
                },
                additional_notes: "Very intelligent, needs lots of exercise and mental stimulation"
            },
            {
                id: "d4e5f6a7-b8c9-4044-1122-ddeeffaabbcc",
                species: "dog",
                breed: "French Bulldog",
                age: 4,
                status: "available",
                intake_date: "2024-02-10T11:20:00Z",
                temperament: ["friendly", "calm", "good_with_kids"],
                medical_issues: {
                    has_issues: true,
                    description: "Mild hip dysplasia, managed with medication"
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: true
                }
            },
            {
                id: "12345678-90ab-cdef-1234-567890abcdef",
                species: "cat",
                breed: "Sphynx",
                age: 3,
                status: "available",
                intake_date: "2024-02-19T13:15:00Z",
                temperament: ["energetic", "friendly", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                },
                additional_notes: "Unique hairless breed, very affectionate"
            },
            {
                id: "23456789-abcd-ef01-2345-6789abcdef01",
                species: "cat",
                breed: "Bengal",
                age: 2,
                status: "available",
                intake_date: "2024-02-17T15:30:00Z",
                temperament: ["energetic", "friendly", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                },
                additional_notes: "Active and playful, needs enrichment"
            },
            {
                id: "34567890-bcde-f012-3456-789abcdef012",
                species: "dog",
                breed: "Husky",
                age: 1,
                status: "available",
                intake_date: "2024-02-21T10:45:00Z",
                temperament: ["energetic", "friendly", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "house",
                    needs_garden: true,
                    floor_restrictions: false
                },
                additional_notes: "Young and energetic, needs active family"
            },
            {
                id: "45678901-cdef-0123-4567-89abcdef0123",
                species: "cat",
                breed: "Norwegian Forest Cat",
                age: 4,
                status: "available",
                intake_date: "2024-02-20T14:20:00Z",
                temperament: ["friendly", "calm", "good_with_kids", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            },
            {
                id: "56789012-def0-1234-5678-9abcdef01234",
                species: "dog",
                breed: "Dachshund",
                age: 3,
                status: "adopted",
                intake_date: "2024-02-01T11:45:00Z",
                temperament: ["friendly", "energetic"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            }
        ]
    },
    {
        _id: "6bf52361-f610-4944-09f4-498490368380",
        shelter_info: {
            name: { $allot: 'Guardian Angel Shelter Gdansk' },
            location: { $allot: 'ul. Schroniskowa 8, 80-001 Gdansk' },
            operational_costs: { $allot: 165000 }
        },
        metrics: {
            current_animals: 4,
            monthly_intake: 10,
            neutering_count: 25,
            adoption_rate: 0.68
        },
        animals: [
            {
                id: "67890123-ef01-2345-6789-abcdef012345",
                species: "cat",
                breed: "Maine Coon Mix",
                age: 5,
                status: "available",
                intake_date: "2024-02-01T15:45:00Z",
                temperament: ["friendly", "calm", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            },
            {
                id: "78901234-f012-3456-789a-bcdef0123456",
                species: "cat",
                breed: "Domestic Shorthair",
                age: 0.5,
                status: "available",
                intake_date: "2024-02-08T13:45:00Z",
                temperament: ["energetic", "friendly", "good_with_kids", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                },
                additional_notes: "Playful kitten, great with children"
            },
            {
                id: "89012345-0123-4567-89ab-cdef01234567",
                species: "dog",
                breed: "Corgi",
                age: 2,
                status: "available",
                intake_date: "2024-02-22T09:30:00Z",
                temperament: ["friendly", "energetic", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "house",
                    needs_garden: true,
                    floor_restrictions: false
                },
                additional_notes: "Charming and intelligent"
            },
            {
                id: "90123456-1234-5678-9abc-def012345678",
                species: "cat",
                breed: "Scottish Fold",
                age: 3,
                status: "available",
                intake_date: "2024-02-21T14:15:00Z",
                temperament: ["calm", "friendly", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            },
            {
                id: "01234567-2345-6789-abcd-ef0123456789",
                species: "dog",
                breed: "Bernese Mountain Dog",
                age: 4,
                status: "adopted",
                intake_date: "2024-02-05T10:20:00Z",
                temperament: ["friendly", "calm", "good_with_kids", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "house",
                    needs_garden: true,
                    floor_restrictions: false
                }
            }
        ]
    },
    {
        _id: "7cf63472-f721-5055-10f5-509501479490",
        shelter_info: {
            name: { $allot: 'Poznan Foster Home' },
            location: { $allot: 'ul. Kocich Lapek 23, 60-001 Poznan' },
            operational_costs: { $allot: 195000 }
        },
        metrics: {
            current_animals: 3,
            monthly_intake: 18,
            neutering_count: 40,
            adoption_rate: 0.79
        },
        animals: [
            {
                id: "abcdef01-3456-789a-bcde-f0123456789a",
                species: "dog",
                breed: "German Shepherd",
                age: 3,
                status: "available",
                intake_date: "2024-02-18T13:15:00Z",
                temperament: ["energetic", "shy", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "house",
                    needs_garden: true,
                    floor_restrictions: false
                },
                additional_notes: "Needs experienced owner, some training required"
            },
            {
                id: "bcdef012-4567-89ab-cdef-0123456789ab",
                species: "cat",
                breed: "Persian Mix",
                age: 2,
                status: "available",
                intake_date: "2024-02-22T11:30:00Z",
                temperament: ["friendly", "calm", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            },
            {
                id: "cdef0123-5678-9abc-def0-123456789abc",
                species: "dog",
                breed: "Australian Shepherd",
                age: 1,
                status: "available",
                intake_date: "2024-02-21T15:45:00Z",
                temperament: ["energetic", "friendly", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "house",
                    needs_garden: true,
                    floor_restrictions: false
                },
                additional_notes: "High energy, needs active lifestyle"
            },
            {
                id: "def01234-6789-abcd-ef01-23456789abcd",
                species: "cat",
                breed: "Ragdoll",
                age: 6,
                status: "adopted",
                intake_date: "2024-02-05T10:30:00Z",
                temperament: ["calm", "friendly", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            }
        ]
    },
    {
        _id: "8df74583-f832-6166-21f6-610612580500",
        shelter_info: {
            name: { $allot: 'Wroclaw Paws & Whiskers' },
            location: { $allot: 'ul. Przyjazna 56, 50-001 Wroclaw' },
            operational_costs: { $allot: 175000 }
        },
        metrics: {
            current_animals: 4,
            monthly_intake: 14,
            neutering_count: 35,
            adoption_rate: 0.71
        },
        animals: [
            {
                id: "ef012345-789a-bcde-f012-3456789abcde",
                species: "cat",
                breed: "Persian",
                age: 7,
                status: "available",
                intake_date: "2024-02-20T16:00:00Z",
                temperament: ["calm", "shy"],
                medical_issues: {
                    has_issues: true,
                    description: "Requires daily grooming"
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            },
            {
                id: "f0123456-89ab-cdef-0123-456789abcdef",
                species: "dog",
                breed: "Cavalier King Charles Spaniel",
                age: 2,
                status: "available",
                intake_date: "2024-02-22T12:00:00Z",
                temperament: ["friendly", "calm", "good_with_kids", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                },
                additional_notes: "Perfect family companion"
            },
            {
                id: "01234567-9abc-def0-1234-56789abcdef0",
                species: "cat",
                breed: "American Shorthair",
                age: 1,
                status: "available",
                intake_date: "2024-02-21T14:30:00Z",
                temperament: ["friendly", "energetic", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            },
            {
                id: "12345678-abcd-ef01-2345-6789abcdef01",
                species: "dog",
                breed: "Bichon Frise",
                age: 3,
                status: "available",
                intake_date: "2024-02-20T09:15:00Z",
                temperament: ["friendly", "energetic", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            },
            {
                id: "23456789-bcde-f012-3456-789abcdef012",
                species: "cat",
                breed: "Siamese",
                age: 2,
                status: "adopted",
                intake_date: "2024-02-17T14:20:00Z",
                temperament: ["energetic", "friendly", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            }
        ]
    },
    {
        _id: "9ef85694-f943-7277-32f7-721723691610",
        shelter_info: {
            name: { $allot: 'Lodz Animal Sanctuary' },
            location: { $allot: 'ul. Zwierzat 34, 90-001 Lodz' },
            operational_costs: { $allot: 168000 }
        },
        metrics: {
            current_animals: 5,
            monthly_intake: 8,
            neutering_count: 20,
            adoption_rate: 0.65
        },
        animals: [
            {
                id: "34567890-cdef-0123-4567-89abcdef0123",
                species: "dog",
                breed: "Labrador Mix",
                age: 1,
                status: "available",
                intake_date: "2024-02-19T11:45:00Z",
                temperament: ["energetic", "friendly", "good_with_kids", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "house",
                    needs_garden: true,
                    floor_restrictions: false
                },
                additional_notes: "Young and playful, great family dog"
            },
            {
                id: "45678901-def0-1234-5678-9abcdef01234",
                species: "dog",
                breed: "Beagle",
                age: 4,
                status: "available",
                intake_date: "2024-02-16T09:30:00Z",
                temperament: ["friendly", "energetic", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "house",
                    needs_garden: true,
                    floor_restrictions: false
                },
                additional_notes: "Loves to play and go for walks"
            },
            {
                id: "56789012-ef01-2345-6789-abcdef012345",
                species: "cat",
                breed: "Abyssinian",
                age: 2,
                status: "available",
                intake_date: "2024-02-22T13:45:00Z",
                temperament: ["energetic", "friendly", "good_with_pets"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            },
            {
                id: "67890123-f012-3456-789a-bcdef0123456",
                species: "cat",
                breed: "Turkish Van",
                age: 3,
                status: "available",
                intake_date: "2024-02-21T10:15:00Z",
                temperament: ["friendly", "energetic", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "apartment",
                    needs_garden: false,
                    floor_restrictions: false
                }
            },
            {
                id: "78901234-0123-4567-89ab-cdef01234567",
                species: "dog",
                breed: "Jack Russell Terrier",
                age: 2,
                status: "available",
                intake_date: "2024-02-20T15:30:00Z",
                temperament: ["energetic", "friendly", "good_with_kids"],
                medical_issues: {
                    has_issues: false
                },
                space_requirements: {
                    min_space: "house",
                    needs_garden: true,
                    floor_restrictions: false
                },
                additional_notes: "Active and intelligent"
            }
        ]
    }
]; 