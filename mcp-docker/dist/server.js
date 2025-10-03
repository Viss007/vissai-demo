import Docker from 'dockerode';
import { createServer } from '@modelcontextprotocol/sdk';
const TIMEOUT_MS = 10_000;
const LABEL_ALLOW = 'mcp=allowed';
function envBool(name, def = false) {
    const v = process.env[name];
    if (v == null)
        return def;
    return v.toLowerCase() === 'true' || v === '1';
}
function parseAllowlist() {
    const s = process.env.IMAGE_ALLOWLIST || 'nginx:alpine,hello-world';
    return new Set(s.split(',').map(v => v.trim()).filter(Boolean));
}
function withTimeout(p, ms = TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('timeout')), ms);
        p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
    });
}
function ok(data) { return { ok: true, data }; }
function err(message) { return { ok: false, error: message }; }
async function main() {
    const docker = new Docker({ socketPath: process.env.DOCKER_HOST?.startsWith('unix://') ? process.env.DOCKER_HOST.replace('unix://', '') : undefined });
    const allowWrite = envBool('ALLOW_WRITE', false);
    const imageAllow = parseAllowlist();
    async function reachable() {
        try {
            await docker.ping();
        }
        catch {
            throw new Error('Docker not reachable');
        }
    }
    const listContainers = {
        name: 'docker.listContainers',
        description: 'List containers with minimal fields; filter by label.',
        inputSchema: {
            type: 'object',
            properties: {
                all: { type: 'boolean' },
                label: { type: 'string', description: 'label filter, defaults to mcp=allowed' }
            },
            additionalProperties: false
        },
        async execute(input) {
            try {
                await reachable();
                const all = !!input?.all;
                const label = input?.label || LABEL_ALLOW;
                const containers = await withTimeout(docker.listContainers({ all, filters: { label: [label] } }));
                const data = containers.map((c) => ({
                    id: c.Id,
                    name: (c.Names && c.Names[0]) || '',
                    image: c.Image,
                    state: c.State,
                    status: c.Status,
                    labels: c.Labels
                }));
                return ok(data);
            }
            catch (e) {
                return err(e?.message || 'list error');
            }
        }
    };
    const containerLogs = {
        name: 'docker.containerLogs',
        description: 'Tail logs for a labeled container',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                tail: { type: 'number', minimum: 1, maximum: 5000 }
            },
            required: ['id'],
            additionalProperties: false
        },
        async execute(input) {
            try {
                await reachable();
                const id = String(input.id);
                const tail = Math.min(Math.max(Number(input.tail || 200), 1), 5000);
                const c = docker.getContainer(id);
                const inspect = await withTimeout(c.inspect());
                if (!inspect?.Config?.Labels || inspect.Config.Labels['mcp'] !== 'allowed')
                    return err('container not allowed');
                const raw = await withTimeout(c.logs({ stdout: true, stderr: true, tail, timestamps: false }));
                const text = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
                // cap
                const trimmed = text.length > 10_000 ? text.slice(-10_000) : text;
                return ok({ id, tail, logs: trimmed });
            }
            catch (e) {
                return err(e?.message || 'logs error');
            }
        }
    };
    const inspectContainer = {
        name: 'docker.inspectContainer',
        description: 'Inspect a labeled container and return a safe subset',
        inputSchema: {
            type: 'object',
            properties: { id: { type: 'string' } },
            required: ['id'],
            additionalProperties: false
        },
        async execute(input) {
            try {
                await reachable();
                const id = String(input.id);
                const c = docker.getContainer(id);
                const info = await withTimeout(c.inspect());
                if (!info?.Config?.Labels || info.Config.Labels['mcp'] !== 'allowed')
                    return err('container not allowed');
                const data = {
                    id,
                    Name: info.Name,
                    Image: info.Config?.Image,
                    State: info.State,
                    Created: info.Created,
                    Labels: info.Config?.Labels,
                    Ports: info.NetworkSettings?.Ports
                };
                return ok(data);
            }
            catch (e) {
                return err(e?.message || 'inspect error');
            }
        }
    };
    const restartContainer = {
        name: 'docker.restartContainer',
        description: 'Restart a labeled container (requires ALLOW_WRITE=true and confirm=true)',
        inputSchema: {
            type: 'object',
            properties: { id: { type: 'string' }, confirm: { type: 'boolean' } },
            required: ['id', 'confirm'],
            additionalProperties: false
        },
        async execute(input) {
            try {
                await reachable();
                if (!allowWrite)
                    return err('write ops disabled');
                if (!input.confirm)
                    return err('confirmation required');
                const id = String(input.id);
                const c = docker.getContainer(id);
                const info = await withTimeout(c.inspect());
                if (!info?.Config?.Labels || info.Config.Labels['mcp'] !== 'allowed')
                    return err('container not allowed');
                await withTimeout(c.restart());
                return ok({ id, restarted: true });
            }
            catch (e) {
                return err(e?.message || 'restart error');
            }
        }
    };
    const pullImage = {
        name: 'docker.pullImage',
        description: 'Pull an allowed image (requires ALLOW_WRITE=true and confirm=true)',
        inputSchema: {
            type: 'object',
            properties: { name: { type: 'string' }, confirm: { type: 'boolean' } },
            required: ['name', 'confirm'],
            additionalProperties: false
        },
        async execute(input) {
            try {
                await reachable();
                if (!allowWrite)
                    return err('write ops disabled');
                if (!input.confirm)
                    return err('confirmation required');
                const name = String(input.name);
                if (!imageAllow.has(name))
                    return err('image not allow-listed');
                const stream = await withTimeout(docker.pull(name));
                await new Promise((resolve, reject) => {
                    docker.modem.followProgress(stream, (err) => err ? reject(err) : resolve());
                });
                return ok({ name, pulled: true });
            }
            catch (e) {
                return err(e?.message || 'pull error');
            }
        }
    };
    const server = createServer({
        name: 'docker-mcp',
        version: '0.1.0',
        tools: [listContainers, containerLogs, inspectContainer, restartContainer, pullImage]
    });
    server.start();
    // eslint-disable-next-line no-console
    console.log('[docker-mcp] started. allowWrite=%s allowlist=%s', allowWrite, Array.from(imageAllow).join(','));
}
main().catch(e => {
    // eslint-disable-next-line no-console
    console.error('[docker-mcp] fatal:', e?.message);
    process.exit(1);
});
//# sourceMappingURL=server.js.map