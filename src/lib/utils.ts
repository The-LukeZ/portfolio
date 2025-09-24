import {
  ButtonStyle,
  ComponentType,
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithURL,
  type APIContainerComponent,
} from "discord-api-types/v10";

function parseTTButtons(
  ...btns: ActionRowButton[]
): (APIButtonComponentWithCustomId | APIButtonComponentWithURL)[] {
  return btns.map((c) =>
    c.style !== ButtonStyle.Link && c.custom_id
      ? { ...c, custom_id: `ticketCreate/${c.custom_id}` }
      : c
  );
}

export function ttComponentsToDiscordComponents(
  components: TopLevelMessageComponent[]
): APIMessageTopLevelComponent[] {
  // The only difference are media and thumbnail items - they directly contain the url property but have to converted to { url }
  const comps: APIMessageTopLevelComponent[] = [];
  for (const comp of components) {
    switch (comp.type) {
      case ComponentType.MediaGallery: {
        const { items, ...rest } = comp;
        comps.push({
          ...rest,
          items: items.map((i) => ({
            ...i,
            media: { url: i.url },
          })),
        });
        break;
      }
      case ComponentType.Section: {
        const { accessory, ...rest } = comp;
        // Only do more if a thumbnail
        if (accessory && accessory.type === ComponentType.Thumbnail) {
          comps.push({
            ...rest,
            accessory: {
              ...accessory,
              media: { url: accessory.url },
            },
          });
        } else if (accessory) {
          comps.push({
            ...rest,
            accessory: parseTTButtons(accessory)[0] as
              | APIButtonComponentWithCustomId
              | APIButtonComponentWithURL,
          });
        }
        break;
      }
      case ComponentType.Container: {
        // Recursive time because containers can contain anything but containers
        const { components: innerComps, ...rest } = comp;
        comps.push({
          ...rest,
          components: ttComponentsToDiscordComponents(innerComps),
        } as APIContainerComponent);
        break;
      }
      case ComponentType.ActionRow: {
        // Transform custom id buttons to have prefix
        const { components: innerComps, ...rest } = comp;
        comps.push({
          ...rest,
          components: parseTTButtons(...innerComps),
        });
        break;
      }
      default:
        comps.push(comp);
        break;
    }
  }

  return comps;
}
