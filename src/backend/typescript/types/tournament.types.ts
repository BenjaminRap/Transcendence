
export interface TournamentParticipant {
    player: number | undefined | string;
    alias: string;
}

export interface CreateTournament {
  title: string; // titre ou nom du tournois
  creator: number | undefined | string; //meme remarque que pour winner et loser au dessus
  participants: TournamentParticipant[]
}
