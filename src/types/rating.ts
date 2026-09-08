export type GameResult='win'|'draw'|'loss';
export interface RatedGame {id:string; opponentRating:number|string; result:GameResult}
export interface PlayerRatingInfo {rating:number; age:number; ratedGamesCompleted:number; previouslyReached2400:boolean; kOverride?:number}
export interface GameCalculation {opponentRating:number; effectiveDifference:number; expectedScore:number; actualScore:number; contribution:number}
export interface RatingCalculation {k:number; rawChange:number; change:number; newRating:number; score:number; games:GameCalculation[]; progression:number[]}
export interface InitialRatingCalculation {eligible:boolean; reason?:string; ratedGames:number; virtualGames:number; score:number; averageOpposition:number; percentage:number; dp:number; initialRating:number|null}
