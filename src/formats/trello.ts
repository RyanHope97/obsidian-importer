import { FormatImporter } from 'format-importer'
import { ImportContext } from 'main';
import { TrelloJson } from './trello/models';
import { Notice, Setting } from 'obsidian';

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

	// TODO:
	// - What data sanitization do we need?
	// - Need to handle duplicate card names correctly.
	// - Need to decide on format for all of these.
	// - Tags for labels?
	// - Card start and due date.
	// - Comments.
	// - Attachments.
	// - Custom fields.
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

		for (let file of files) {
			if (ctx.isCancelled()) return;
			// Read the JSON file
			let content = await file.readText();

			// Parse the file
			const trelloJson = JSON.parse(content) as TrelloJson;

			const boardPath = `${folder.path}/${trelloJson.name}`;

			// Create folder per-board
			const boardFolder = await this.createFolders(boardPath);

			// Create markdown file per-card
			for (let card of trelloJson.cards) {
				if (card.closed && !this.importArchived) {
					ctx.reportSkipped(card.name, 'Archived card');
					continue;
				}

				let cardContent: string[] = [];

				cardContent.push('# Description');
				cardContent.push('\n\n');
				cardContent.push(card.desc);

				await this.saveAsMarkdownFile(boardFolder, card.name, cardContent.join(''));
				ctx.reportNoteSuccess(card.name);
			}

			// Create markdown file for the board
			let boardContent: string[] = [];

			boardContent.push('# Description');
			boardContent.push('\n\n');
			boardContent.push(trelloJson.desc);
			boardContent.push('\n\n');

			// Get the lists
			for (let list of trelloJson.lists) {
				if (list.closed && !this.importArchived) {
					ctx.reportSkipped(list.name, 'Archived list');
					continue;
				}

				boardContent.push(`## ${list.name}`);
				boardContent.push('\n\n');

				for (let card of trelloJson.cards.filter(x => x.idList == list.id)) {
					boardContent.push(`[[${card.name}]]`);
					boardContent.push('\n');
				}
				boardContent.push('\n');
			}

			await this.saveAsMarkdownFile(boardFolder, trelloJson.name, boardContent.join(''));
		}
	}
}
