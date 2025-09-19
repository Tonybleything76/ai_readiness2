// Fixed streaming section to address race condition

// CORRECTED VERSION - replace lines 275-316 in backup-database.js

} else {
  // For other formats or compression, handle streaming
  const pgDumpProcess = spawn('pg_dump', pgDumpArgs, { env, shell: false });
  
  let stderr = '';
  
  // Set up stderr capture immediately to avoid race conditions
  pgDumpProcess.stderr.on('data', (data) => {
    stderr += data.toString();
  });
  
  // Create process exit promise immediately before any I/O
  const processExitPromise = new Promise((resolve, reject) => {
    pgDumpProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pg_dump failed with exit code ${code}\nStderr: ${stderr}`));
      }
    });
    
    pgDumpProcess.on('error', (error) => {
      reject(new Error(`Failed to execute pg_dump: ${error.message}`));
    });
  });
  
  // Set up output pipeline
  let pipelinePromise;
  if (config.compress) {
    // Create gzip compression pipeline
    const gzipStream = createGzip();
    const outputStream = createWriteStream(backupPath);
    
    pipelinePromise = pipeline(
      pgDumpProcess.stdout,
      gzipStream,
      outputStream
    );
  } else {
    // Direct file output
    const outputStream = createWriteStream(backupPath);
    pipelinePromise = pipeline(pgDumpProcess.stdout, outputStream);
  }
  
  try {
    // Wait for both pipeline and process to complete
    await Promise.all([pipelinePromise, processExitPromise]);
    
    // Log verbose output only after successful completion
    if (config.verbose && stderr) {
      log(`pg_dump output: ${stderr}`, true);
    }
  } catch (error) {
    // Kill the process if still running to avoid zombies
    if (!pgDumpProcess.killed) {
      pgDumpProcess.kill('SIGTERM');
    }
    throw error;
  }
}