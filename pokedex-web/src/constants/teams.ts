export type TeamName = 'Mystic' | 'Valor' | 'Instinct';

export interface Team {
    id: TeamName;
    name: string;
    color: string;
    description: string;
    leader: string;
    image: any;
}

import instinctIcon from '@/assets/team-icons/instinct.png';
import mysticIcon from '@/assets/team-icons/mystic.png';
import valorIcon from '@/assets/team-icons/valor.png';

export const TEAMS: Record<TeamName, Team> = {
    Mystic: {
        id: 'Mystic',
        name: 'Team Mystic',
        color: '#2a6eb2',
        description: 'Wisdom, analysis, and calm. We study Pokémon evolution.',
        leader: 'BLANCHE',
        image: mysticIcon,
    },
    Valor: {
        id: 'Valor',
        name: 'Team Valor',
        color: '#d13c32',
        description: 'Strength, passion, and bravery. We train for power.',
        leader: 'CANDELA',
        image: valorIcon,
    },
    Instinct: {
        id: 'Instinct',
        name: 'Team Instinct',
        color: '#e8cb36',
        description: 'Intuition, trust, and speed. We believe in natural talent.',
        leader: 'SPARK',
        image: instinctIcon,
    },
};

export const TEAM_LIST = Object.values(TEAMS);
