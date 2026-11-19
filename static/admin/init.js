// Sveltia CMS config for feed posts (posts/*.md). Field rules mirror the build-time validation in
// vite-plugins/posts/validate.ts; the build stays the final check.
const projects = await fetch("/admin/projects.json")
  .then((res) => (res.ok ? res.json() : []))
  .catch(() => []);

const datetime = { widget: "datetime", format: "YYYY-MM-DDTHH:mm:ssZ" };

CMS.init({
  config: {
    load_config_file: false,
    backend: {
      name: "github",
      repo: "The-LukeZ/portfolio",
      branch: "main",
      base_url: location.origin,
      auth_endpoint: "api/cms/auth",
    },
    site_url: "https://thelukez.com",
    display_url: "https://thelukez.com/feed",
    media_folder: "static/media/feed",
    public_folder: "/media/feed",
    media_libraries: {
      default: { config: { max_file_size: 2_097_152 } },
    },
    collections: [
      {
        name: "posts",
        label: "Posts",
        label_singular: "Post",
        folder: "posts",
        extension: "md",
        format: "frontmatter",
        create: true,
        slug: "{{fields.slug}}",
        identifier_field: "title",
        summary: "{{title}} ({{date}})",
        sortable_fields: ["date", "title"],
        preview_path: "feed/{{fields.slug}}",
        fields: [
          {
            name: "slug",
            label: "Slug",
            widget: "string",
            pattern: ["^[a-z0-9-]+$", "Only a-z, 0-9 and -"],
            hint: "Part of the URL (/feed/<slug>). Never change it after publishing.",
          },
          { name: "title", label: "Title", widget: "string", maxlength: 200 },
          { name: "date", label: "Publish date", ...datetime, default: "{{now}}" },
          {
            name: "summary",
            label: "Summary",
            widget: "text",
            maxlength: 300,
            hint: "Plain text. Used in the list, RSS, link previews and Discord.",
          },
          {
            name: "project",
            label: "Project",
            widget: "select",
            options: projects,
            required: false,
          },
          {
            name: "image",
            label: "Cover image",
            widget: "object",
            required: false,
            fields: [
              {
                name: "src",
                label: "Image",
                widget: "image",
                accept: "image/png,image/jpeg,image/webp,image/gif",
              },
              { name: "alt", label: "Alt text", widget: "string" },
            ],
          },
          {
            name: "draft",
            label: "Draft",
            widget: "boolean",
            default: true,
            hint: "Drafts are never published. Turn off to publish at the date above.",
          },
          { name: "updated", label: "Updated", ...datetime, required: false },
          { name: "body", label: "Body", widget: "markdown" },
        ],
      },
    ],
  },
});
