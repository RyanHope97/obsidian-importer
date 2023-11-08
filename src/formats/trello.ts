import { FormatImporter } from "format-importer"
import { ImportContext } from "main";

export class TrelloImporter extends FormatImporter {
	init(): void {
		this.addFileChooserSetting('Trello (.json)', ['json']);
		this.addOutputLocationSetting('Trello');
	}

	async import(ctx: ImportContext): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
