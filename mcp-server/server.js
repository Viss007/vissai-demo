#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const PROJECT_ROOT = '/workspaces/vissai-demo';

class VissaiDemoMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'vissai-demo-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'check_health',
            description: 'Check the health status of the vissai-demo application',
            inputSchema: {
              type: 'object',
              properties: {
                port: {
                  type: 'number',
                  description: 'Port number to check (default: 3000)',
                  default: 3000
                }
              }
            }
          },
          {
            name: 'run_tests',
            description: 'Run the Vitest test suite for the project',
            inputSchema: {
              type: 'object',
              properties: {
                watch: {
                  type: 'boolean',
                  description: 'Run tests in watch mode',
                  default: false
                }
              }
            }
          },
          {
            name: 'build_project',
            description: 'Build the Next.js project for production',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'check_api_status',
            description: 'Test all API endpoints with sample requests',
            inputSchema: {
              type: 'object',
              properties: {
                baseUrl: {
                  type: 'string',
                  description: 'Base URL for API testing',
                  default: 'http://localhost:3000'
                }
              }
            }
          },
          {
            name: 'get_project_info',
            description: 'Get comprehensive project information and structure',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'run_smoke_test',
            description: 'Run the complete smoke test sequence as defined in copilot instructions',
            inputSchema: {
              type: 'object',
              properties: {
                port: {
                  type: 'number',
                  description: 'Port to run smoke test on',
                  default: 3001
                }
              }
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'check_health':
            return await this.checkHealth(request.params.arguments?.port || 3000);
          
          case 'run_tests':
            return await this.runTests(request.params.arguments?.watch || false);
          
          case 'build_project':
            return await this.buildProject();
          
          case 'check_api_status':
            return await this.checkApiStatus(request.params.arguments?.baseUrl || 'http://localhost:3000');
          
          case 'get_project_info':
            return await this.getProjectInfo();
          
          case 'run_smoke_test':
            return await this.runSmokeTest(request.params.arguments?.port || 3001);
          
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
      }
    });
  }

  async checkHealth(port) {
    try {
      const { stdout, stderr } = await execAsync(`curl -s http://localhost:${port}/api/healthz`);
      const response = JSON.parse(stdout);
      
      return {
        content: [
          {
            type: 'text',
            text: `Health Check Result:\n${JSON.stringify(response, null, 2)}\n\nStatus: ${response.ok ? '✅ Healthy' : '❌ Unhealthy'}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Health check failed: ${error.message}\nMake sure the application is running on port ${port}`
          }
        ]
      };
    }
  }

  async runTests(watch) {
    try {
      const command = watch ? 'npm test -- --watch' : 'npm test';
      const { stdout, stderr } = await execAsync(command, { cwd: PROJECT_ROOT });
      
      return {
        content: [
          {
            type: 'text',
            text: `Test Results:\n${stdout}\n${stderr ? `Errors:\n${stderr}` : ''}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Tests failed:\n${error.stdout || ''}\n${error.stderr || ''}`
          }
        ]
      };
    }
  }

  async buildProject() {
    try {
      const { stdout, stderr } = await execAsync('npm run build', { cwd: PROJECT_ROOT });
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Build successful:\n${stdout}\n${stderr ? `Warnings:\n${stderr}` : ''}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Build failed:\n${error.stdout || ''}\n${error.stderr || ''}`
          }
        ]
      };
    }
  }

  async checkApiStatus(baseUrl) {
    const endpoints = [
      { method: 'GET', path: '/api/healthz' },
      { 
        method: 'POST', 
        path: '/api/run',
        body: '{"name":"Test","phone":"+123","reason":"info","action":"booking","lang":"en"}'
      },
      {
        method: 'POST',
        path: '/api/chat',
        body: '{"message":"Say hi in one sentence."}'
      }
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const curlCmd = endpoint.method === 'GET' 
          ? `curl -s "${baseUrl}${endpoint.path}"`
          : `curl -s -X ${endpoint.method} "${baseUrl}${endpoint.path}" -H "content-type: application/json" -d '${endpoint.body}'`;
        
        const { stdout, stderr } = await execAsync(curlCmd);
        const response = JSON.parse(stdout);
        
        results.push({
          endpoint: `${endpoint.method} ${endpoint.path}`,
          status: '✅ Success',
          response: response
        });
      } catch (error) {
        results.push({
          endpoint: `${endpoint.method} ${endpoint.path}`,
          status: '❌ Failed',
          error: error.message
        });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `API Status Report:\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  }

  async getProjectInfo() {
    try {
      const packageJson = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
      const readmeExists = await fs.access(path.join(PROJECT_ROOT, 'README.md')).then(() => true).catch(() => false);
      const dockerfileExists = await fs.access(path.join(PROJECT_ROOT, 'Dockerfile')).then(() => true).catch(() => false);
      
      const info = {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        scripts: packageJson.scripts,
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
        hasReadme: readmeExists,
        hasDockerfile: dockerfileExists,
        nodeVersion: packageJson.engines?.node
      };

      return {
        content: [
          {
            type: 'text',
            text: `Project Information:\n${JSON.stringify(info, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get project info: ${error.message}`
          }
        ]
      };
    }
  }

  async runSmokeTest(port) {
    try {
      // Build and start server
      await execAsync('npm run build', { cwd: PROJECT_ROOT });
      
      // Start server in background
      const serverProcess = exec(`PORT=${port} npm start`, { cwd: PROJECT_ROOT });
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Run smoke tests
      const tests = [
        `curl -fsSL http://localhost:${port}/api/healthz`,
        `curl -fsSL -X POST http://localhost:${port}/api/run -H 'content-type: application/json' -d '{"name":"Test","phone":"+123","reason":"info","action":"booking","lang":"en"}'`,
        `curl -fsSL -X POST http://localhost:${port}/api/chat -H 'content-type: application/json' -d '{"message":"Say hi in one sentence."}'`
      ];

      const results = [];
      for (const test of tests) {
        try {
          const { stdout } = await execAsync(test);
          results.push(`✅ ${test}\nResponse: ${stdout}\n`);
        } catch (error) {
          results.push(`❌ ${test}\nError: ${error.message}\n`);
        }
      }

      // Kill server
      await execAsync(`pkill -f "next start"`).catch(() => {});
      
      return {
        content: [
          {
            type: 'text',
            text: `🧪 Smoke Test Results:\n${results.join('\n')}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Smoke test failed: ${error.message}`
          }
        ]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vissai Demo MCP server running on stdio');
  }
}

const server = new VissaiDemoMCPServer();
server.run().catch(console.error);