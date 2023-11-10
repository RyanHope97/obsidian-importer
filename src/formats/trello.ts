import { FormatImporter } from "format-importer"
import { ImportContext } from "main";
import { TrelloJson } from './trello/models';
import { Notice, Setting } from "obsidian";

export class TrelloImporter extends FormatImporter {
	importArchived: boolean = false;
	downloadAttachments: boolean = false;

	init(): void {
		this.addFileChooserSetting('Trello (.json)', ['json'], true);

		new Setting(this.modal.contentEl)
			.setName('Import archived cards and lists')
			.setDesc('If imported, cards and lists archived in Trello will be tagged as archived.')
			.addToggle(toggle => {
				toggle.setValue(this.importArchived);
				toggle.onChange(async (value) => {
					this.importArchived = value;
				});
			});

		new Setting(this.modal.contentEl)
			.setName('Download all attachments')
			.setDesc('If enabled, all attachments uploaded to Trello will be downloaded to your attachments folder.')
			.addToggle(toggle => {
				toggle.setValue(this.downloadAttachments);
				toggle.onChange(async (value) => {
					this.downloadAttachments = value;
				});
			});

		this.addOutputLocationSetting('Trello');
	}

	async import(ctx: ImportContext): Promise<void> {
		let { files } = this;

		if (files.length === 0) {
			new Notice('Please pick at least one file to import.');
			return;
		}

		let folder = await this.getOutputFolder();
		if (!folder) {
			new Notice('Please select a location to import your files to.');
			return;
		}
		let attachmentFolderPath = `${folder.path}/Attachments`;

		for (let file of files) {
			if (ctx.isCancelled()) return;
			console.log(file);

			// Read the JSON file
			let content = await file.readText();

			// Parse the file
			const trelloJson = JSON.parse(content) as TrelloJson;

			console.log(trelloJson);

			// TODO:
			// - What data sanitization do we need?
			// - Create folder per-board.
			// - Create .md per-board.
			// - Create .md per-card. Need to handle duplicate card names.
			// - Add lists with links to cards in per-board .md.
			// - Need to decide on format for all of these.
			// - Tags for labels?
		}
	}
}
