<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	interface Props {
		content: string;
		baseUrl?: string;
	}

	let { content, baseUrl }: Props = $props();

	marked.setOptions({
		gfm: true,
		breaks: true
	});

	const html = $derived(
		DOMPurify.sanitize(
			marked.parse(content, { async: false }) as string,
			{
				ADD_TAGS: ['input'],
				ADD_ATTR: ['checked', 'disabled', 'type']
			}
		)
	);
</script>

<div class="markdown-body">
	{@html html}
</div>

<style>
	.markdown-body :global(input[type="checkbox"]) {
		margin-right: 6px;
		accent-color: #58CC02;
		pointer-events: none;
	}

	.markdown-body :global(.task-list-item) {
		list-style: none;
		margin-left: -1.5em;
	}

	.markdown-body :global(details) {
		border: 2px solid #E5E5E5;
		border-radius: 12px;
		padding: 12px;
		margin: 0.75em 0;
	}

	.markdown-body :global(summary) {
		cursor: pointer;
		font-weight: 700;
	}

	.markdown-body :global(kbd) {
		display: inline-block;
		padding: 2px 6px;
		font-size: 0.85em;
		line-height: 1;
		color: #3C3C3C;
		background: #F7F7F7;
		border: 1px solid #CDCDCD;
		border-radius: 4px;
		box-shadow: 0 1px 0 #CDCDCD;
		font-family: ui-monospace, monospace;
	}

	.markdown-body :global(sup a) {
		text-decoration: none;
		font-weight: 700;
	}

	.markdown-body :global(.highlight) {
		margin: 1em 0;
	}
</style>
