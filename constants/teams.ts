export type TeamName = 'Mystic' | 'Valor' | 'Instinct';

export interface Team {
    id: TeamName;
    name: string;
    color: string;
    image: any;
    description: string;
}

export const TEAMS: Record<TeamName, Team> = {
    Mystic: {
        id: 'Mystic',
        name: 'Team Mystic',
        color: '#007AFF', // Blue
        image: require('@/assets/team-icons/mystic.png'),
        description: 'Wisdom over passion. Calm and collected.',
    },
    Valor: {
        id: 'Valor',
        name: 'Team Valor',
        color: '#FF3B30', // Red
        image: require('@/assets/team-icons/valor.png'),
        description: 'Passion and strength. Fire in the heart.',
    },
    Instinct: {
        id: 'Instinct',
        name: 'Team Instinct',
        color: '#FFCC00', // Yellow
        image: require('@/assets/team-icons/instinct.png'),
        description: 'Trust your instincts. Lightning fast.',
    },
};

export const TEAM_LIST = Object.values(TEAMS);
