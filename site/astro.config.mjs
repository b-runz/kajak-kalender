// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Kajak Kalender',
			tableOfContents: false,
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/b-runz/kajak-kalender' }],
			sidebar: [
				{
					label: 'Generator', items: [
						{ label: 'Login side', slug: '' },
						{ label: 'Kalender Link', slug: 'calendarlink' },
					]
				},
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Sæt Google kalender op på PC', slug: 'guides/google-kalender-pc' },
						{ label: 'Sæt Google kalender op på mobil', slug: 'guides/google-kalender-mobil' },
						{ label: 'Sæt Iphone kalender op på PC', slug: 'guides/iphone-kalender-pc' },
						{ label: 'Sæt Iphone kalender op på mobil', slug: 'guides/iphone-kalender-mobil' },
						{ label: 'Sæt Outlook kalender op på PC', slug: 'guides/outlook-kalender-pc' },
						{ label: 'Sæt Outlook kalender op på mobil', slug: 'guides/outlook-kalender-mobil' },
					],
				},
				{
					label: 'Data og Sikkerhed',
					autogenerate: { directory: 'data' },
				},
			],
			pagination: false,
			components: {
				Search: './src/components/Empty.astro'
			}
		}),
	],
});
