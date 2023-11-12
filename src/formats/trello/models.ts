// TODO:
// - Lookup how to use TypeScript.
// - Custom fields.

export interface TrelloJson {
	name: string;
	desc: string;
	lists: TrelloList[];
	cards: TrelloCard[];
	actions: TrelloAction[];
}

interface TrelloList {
	id: string;
	name: string;
	closed: boolean; // Archived
}

interface TrelloCard {
	name: string;
	desc: string;
	closed: boolean; // Archived
	attachments: TrelloAttachment[];
	labels: TrelloLabel[];
	idList: string;
	due: string;
	start: string;
}

// Comments are stored in "actions" array
interface TrelloAction {
	data: TrelloActionData;
	type: string; // "commentCard", "copyCommentCard"
}

interface TrelloActionData {
	text: string;
}

interface TrelloAttachment {
	name: string;
	url: string;
}

interface TrelloLabel {
	name: string;
	color: string;
}
