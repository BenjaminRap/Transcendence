
export interface TournamentParticipant {
    player: number | undefined | string;
    alias: string;
}

export interface CreateTournament {
  title: string; // titre ou nom du tournois
  creator: number | undefined | string;
  participants: TournamentParticipant[]
}
