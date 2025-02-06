import { spawn } from 'node:child_process';
import path from 'node:path';

interface PythonResponse {
    status: 'success' | 'error';
    data?: Record<string, unknown>;
    error?: string;
}

export async function executePythonScript(
    scriptName: string,
    inputData?: Record<string, unknown>
): Promise<PythonResponse> {
    return new Promise((resolve) => {
        const scriptDir = path.join(process.cwd(), 'scripts');
        const venvPython = process.platform === 'win32'
            ? path.join(scriptDir, 'venv', 'Scripts', 'python.exe')
            : path.join(scriptDir, 'venv', 'bin', 'python');
        
        const scriptPath = path.join(scriptDir, 'python', scriptName);
        const args = inputData ? [scriptPath, JSON.stringify(inputData)] : [scriptPath];

        const pythonProcess = spawn(venvPython, args);
        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                resolve({
                    status: 'error',
                    error: errorData || 'Python script execution failed'
                });
                return;
            }

            try {
                const result = JSON.parse(outputData);
                resolve({
                    status: 'success',
                    data: result
                });
            } catch {
                resolve({
                    status: 'error',
                    error: 'Failed to parse Python script output'
                });
            }
        });

        pythonProcess.on('error', (error) => {
            resolve({
                status: 'error',
                error: `Failed to start Python process: ${error.message}`
            });
        });
    });
} 