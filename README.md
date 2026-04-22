# Brightcove Video

Brightcove video content element that embeds a Brightcove player via account, player, and video IDs.

**Type:** `BRIGHTCOVE_VIDEO`

## Data

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | `string?` | Brightcove account id |
| `playerId` | `string?` | Brightcove player id |
| `videoId` | `string?` | Brightcove video id |

## Edit

- Brightcove player preview when configured
- Top toolbar with Account Id, Player Id, and Video Id text fields
- Edit/Save/Cancel workflow with required field validation

## Display

- Renders the configured Brightcove player
- Graceful error state when player fails to load

## Development

```sh
pnpm dev     # Preview :8080 | Edit :8010 | Display :8020 | Server :8030
pnpm build
pnpm lint
pnpm test
```

## Run with Docker

```sh
docker compose up
```
