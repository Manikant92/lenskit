export const tikTokVoices = {
    'English US': [
        { id: 'en_us_001', name: 'Female' },
        { id: 'en_us_006', name: 'Male 1' },
        { id: 'en_us_007', name: 'Male 2' },
        { id: 'en_us_009', name: 'Male 3' },
        { id: 'en_us_010', name: 'Male 4' },
        { id: 'en_male_narration', name: 'Male, Narrator' },
        { id: 'en_male_funny', name: 'Male, Funny' },
        { id: 'en_female_emotional', name: 'Female, Peaceful' },
        { id: 'en_male_cody', name: 'Male, Serious' },
    ] as const,

    'English UK': [
        { id: 'en_uk_001', name: 'Male 1' },
        { id: 'en_uk_003', name: 'Male 2' },
    ] as const,

    Italian: [{ id: 'it_male_m18', name: 'Male' }] as const,

    'English AU': [
        { id: 'en_au_001', name: 'Female' },
        { id: 'en_au_002', name: 'Male' },
    ] as const,

    French: [
        { id: 'fr_001', name: 'Male 1' },
        { id: 'fr_002', name: 'Male 2' },
    ] as const,

    German: [
        { id: 'de_001', name: 'Female' },
        { id: 'de_002', name: 'Male' },
    ] as const,

    Spanish: [{ id: 'es_002', name: 'Male' }] as const,

    'Spanish MX': [{ id: 'es_mx_002', name: 'Male' }] as const,

    'Portuguese BR': [
        { id: 'br_001', name: 'Female 1' },
        { id: 'br_003', name: 'Female 2' },
        { id: 'br_004', name: 'Female 3' },
        { id: 'br_005', name: 'Male' },
    ] as const,

    Indonesian: [{ id: 'id_001', name: 'Female' }] as const,
    Japanese: [
        { id: 'jp_001', name: 'Female 1' },
        { id: 'jp_003', name: 'Female 2' },
        { id: 'jp_005', name: 'Female 3' },
        { id: 'jp_006', name: 'Male' },
    ] as const,
    Korean: [
        { id: 'kr_002', name: 'Male 1' },
        { id: 'kr_004', name: 'Male 2' },
        { id: 'kr_003', name: 'Female' },
    ] as const,

    Characters: [
        { id: 'en_us_ghostface', name: 'Ghostface (Scream)' },
        { id: 'en_us_chewbacca', name: 'Chewbacca (Star Wars)' },
        { id: 'en_us_c3po', name: 'C3PO (Star Wars)' },
        { id: 'en_us_stitch', name: 'Stitch (Lilo & Stitch)' },
        { id: 'en_us_stormtrooper', name: 'Stormtrooper (Star Wars)' },
        { id: 'en_us_rocket', name: 'Rocket (Guardians of the Galaxy)' },
    ] as const,

    Singing: [
        { id: 'en_female_f08_salut_damour', name: 'Alto' },
        { id: 'en_male_m03_lobby', name: 'Tenor' },
        { id: 'en_male_m03_sunshine_soon', name: 'Sunshine Soon' },
        { id: 'en_female_f08_warmy_breeze', name: 'Warmy Breeze' },
        { id: 'en_female_ht_f08_glorious', name: 'Glorious' },
        { id: 'en_male_sing_funny_it_goes_up', name: 'It Goes Up' },
        { id: 'en_male_m2_xhxs_m03_silly', name: 'Chipmunk' },
        { id: 'en_female_ht_f08_wonderful_world', name: 'Dramatic' },
    ] as const,
} as const

export type TTSLanguage = keyof typeof tikTokVoices

export const localesForTikTok: Record<string, TTSLanguage> = {
    'en-US': 'English US',
    'en-GB': 'English UK',
    'it-IT': 'Italian',
    'en-AU': 'English AU',
    'fr-FR': 'French',
    'de-DE': 'German',
    'es-ES': 'Spanish',
    'es-MX': 'Spanish MX',
    'pt-BR': 'Portuguese BR',
    'id-ID': 'Indonesian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
} as const

// convert option xml to json
