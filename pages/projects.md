---
title: Projects - Alankyle
display: Projects
description: My projects
wrapperClass: 'text-center'
art: dots
projects: {}
---

<!-- @layout-full-width -->
<ListProjects v-if="Object.keys(frontmatter.projects).length" :projects="frontmatter.projects" />
<p v-else class="text-center opacity-50 my-12">暂无项目，敬请期待。</p>
