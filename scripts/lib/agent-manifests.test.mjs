import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { buildAgentManifests } from '../agent-manifests.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));

test('every Codex listing includes the canonical policy URLs and submission-length text', async () => {
  const files = await buildAgentManifests(root);
  const manifests = Object.entries(files).filter(([name]) => name.endsWith('/.codex-plugin/plugin.json'));
  assert.ok(manifests.length > 0);
  for (const [name, content] of manifests) {
    const { interface: listing } = JSON.parse(content);
    assert.equal(listing.privacyPolicyURL, 'https://capgo.app/privacy/', name);
    assert.equal(listing.termsOfServiceURL, 'https://capgo.app/tos/', name);
    for (const field of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
      const url = new URL(listing[field]);
      assert.equal(url.protocol, 'https:', name);
      assert.equal(url.username + url.password, '', name);
    }
    for (const field of ['displayName', 'shortDescription']) {
      assert.ok(listing[field].length > 0 && listing[field].length <= 30, `${name}: ${field}`);
    }
  }
});

test('only Capgo Cloud bundles the hosted MCP, preserving skills-only plugin scope', async () => {
  const files = await buildAgentManifests(root);
  for (const [name, content] of Object.entries(files)) {
    if (!name.endsWith('/.codex-plugin/plugin.json')) continue;
    const plugin = JSON.parse(content);
    assert.equal(plugin.mcpServers, plugin.name === 'capgo-cloud' ? './mcp.json' : undefined, name);
  }
  const { mcpServers } = JSON.parse(files['plugins/capgo-cloud/mcp.json']);
  assert.equal(mcpServers.capgo.url, 'https://api.capgo.app/mcp');
  assert.equal(mcpServers.capgo.extensions['com.openai'].auth.type, 'oauth');
});
