import { FrontendTournament, type Profile } from "./pong/FrontendTournament";

function	createProfiles(count : number) : Profile[]
{
	const	profiles : Profile[] = [];

	for (let index = 0; index < count; index++) {
		profiles.push({
			name : index.toString(),
			image : index.toString()
		})
	}
	return profiles;
}

const	profiles = createProfiles(16);
const	tournament = new FrontendTournament(profiles);
