import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-2 font-semibold">
          <span className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-pink-500 text-[11px] font-bold text-white">
            O
          </span>
          {appName}
        </span>
      ),
    },
    links: [{ text: 'Docs', url: '/docs', active: 'nested-url' }],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
