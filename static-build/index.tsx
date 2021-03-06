/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { h } from 'preact';
import { Feed } from 'feed';

import { renderPage, writeFiles, getPostPath, getPostUrl } from './utils';
import IndexPage from './pages/index';
import posts from 'post-data:';
import WhoPage from './pages/who';
import PostPage from './pages/post';
import iconUrl from 'asset-url:./pages/post/icon.png';

interface Output {
  [outputPath: string]: string;
}
const toOutput: Output = {
  'who/index.html': renderPage(<WhoPage />),
};

// Paginated index pages
const indexPageSize = 10;
const paginatedPosts = Array.from(
  { length: Math.ceil(posts.length / indexPageSize) },
  (_, i) => posts.slice(indexPageSize * i, indexPageSize * i + indexPageSize),
);

for (const [i, posts] of paginatedPosts.entries()) {
  toOutput[i === 0 ? `index.html` : `${i + 1}.html`] = renderPage(
    <IndexPage
      posts={posts}
      pageNum={i + 1}
      totalPages={paginatedPosts.length}
    />,
  );
}

// Post pages & RSS
const feed = new Feed({
  title: `Jake Archibald's blog`,
  link: `https://jakearchibald.com/`,
  id: `https://jakearchibald.com/`,
  language: `en-gb`,
  image: `https://jakearchibald.com${iconUrl}`,
  favicon: `https://jakearchibald.com/favicon.ico`,
  copyright: 'https://creativecommons.org/licenses/by/4.0/',
});

for (const post of posts) {
  toOutput[getPostPath(post) + 'index.html'] = renderPage(
    <PostPage post={post} />,
  );

  feed.addItem({
    title: post.title,
    id: getPostUrl(post),
    link: `https://jakearchibald.com${getPostUrl(post)}`,
    content: post.content,
    description: post.meta,
    date: new Date(post.date),
    image: post.image
      ? `https://jakearchibald.com${post.image}`
      : `https://jakearchibald.com${iconUrl}`,
  });
}

toOutput['posts.rss'] = feed.atom1();

writeFiles(toOutput);
