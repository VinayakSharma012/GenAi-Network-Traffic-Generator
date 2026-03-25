"""
GenAI Traffic Generator - Flask REST API
Provides endpoints to control and monitor traffic generation
Serves frontend as static files for single-website deployment
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import subprocess
import os
import logging
from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST_DIR = BASE_DIR.parent / 'frontend' / 'dist'
LOG_FILE = BASE_DIR / 'traffic_log.txt'

# Serve frontend from ../frontend/dist
app = Flask(__name__, static_folder=str(FRONTEND_DIST_DIR), static_url_path='')
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "*",
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global traffic process
traffic_process = None

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found', 'status': 404}), 404

@app.errorhandler(500)
def server_error(e):
    logger.error(f"Server error: {str(e)}")
    return jsonify({'error': 'Internal server error', 'status': 500}), 500

@app.before_request
def before_request():
    logger.info(f"{request.method} {request.path}")

@app.after_request
def after_request(response):
    logger.info(f"Response: {response.status_code}")
    return response

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'version': '1.0.0',
        'service': 'genai-traffic-api',
        'frontend_built': FRONTEND_DIST_DIR.exists(),
    }), 200

@app.route('/api/defaults', methods=['GET'])
def defaults():
    """Get default configuration"""
    return jsonify({
        'http_target': 'http://httpbin.org',
        'dns_server': '8.8.8.8',
        'smtp_host': 'localhost',
        'smtp_port': 1025,
        'ftp_host': 'ftp.dlptest.com',
    }), 200

@app.route('/api/logs', methods=['GET'])
def logs():
    """Get traffic logs"""
    try:
        if LOG_FILE.exists():
            with LOG_FILE.open('r') as f:
                lines = f.readlines()
                return jsonify({
                    'total_lines': len(lines),
                    'logs': lines[-100:],  # Last 100 lines
                    'timestamp': LOG_FILE.stat().st_mtime
                }), 200
        return jsonify({'logs': [], 'total_lines': 0}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/traffic/start', methods=['POST'])
def start_traffic():
    """Start traffic generation"""
    global traffic_process
    
    # Check if already running
    if traffic_process is not None and traffic_process.poll() is None:
        return jsonify({'status': 'already_running', 'message': 'Traffic generation is already running'}), 400
    
    try:
        config = request.json or {}
        cmd = [sys.executable, 'main.py']
        
        # Build command from config
        if config.get('http_count', 0) > 0:
            cmd.extend(['--http-target', config.get('http_target', 'http://httpbin.org')])
            cmd.extend(['--http-count', str(config['http_count'])])
        else:
            cmd.append('--skip-http')
        
        if config.get('dns_count', 0) > 0:
            cmd.extend(['--dns-server', config.get('dns_server', '8.8.8.8')])
            cmd.extend(['--dns-count', str(config['dns_count'])])
        else:
            cmd.append('--skip-dns')
        
        if config.get('smtp_count', 0) > 0:
            cmd.extend(['--smtp-host', config.get('smtp_host', 'localhost')])
            cmd.extend(['--smtp-port', str(config.get('smtp_port', 1025))])
            cmd.extend(['--smtp-count', str(config['smtp_count'])])
        else:
            cmd.append('--skip-smtp')
        
        if config.get('ftp_count', 0) > 0:
            cmd.extend(['--ftp-host', config.get('ftp_host', 'ftp.dlptest.com')])
            cmd.extend(['--ftp-count', str(config['ftp_count'])])
        
        logger.info(f"Starting traffic generation with: {' '.join(cmd)}")
        traffic_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=str(BASE_DIR),
        )
        
        return jsonify({
            'status': 'started',
            'pid': traffic_process.pid,
            'message': 'Traffic generation started successfully'
        }), 200
    except Exception as e:
        logger.error(f"Error starting traffic: {str(e)}")
        return jsonify({'error': str(e), 'status': 'failed'}), 500

@app.route('/api/traffic/stop', methods=['POST'])
def stop_traffic():
    """Stop traffic generation"""
    global traffic_process
    
    try:
        if traffic_process is None or traffic_process.poll() is not None:
            return jsonify({'status': 'not_running', 'message': 'No traffic generation running'}), 200
        
        traffic_process.terminate()
        try:
            traffic_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            traffic_process.kill()
            traffic_process.wait()
        
        traffic_process = None
        logger.info("Traffic generation stopped")
        return jsonify({'status': 'stopped', 'message': 'Traffic generation stopped successfully'}), 200
    except Exception as e:
        logger.error(f"Error stopping traffic: {str(e)}")
        return jsonify({'error': str(e), 'status': 'failed'}), 500

@app.route('/api/traffic/status', methods=['GET'])
def traffic_status():
    """Get traffic generation status"""
    global traffic_process
    
    is_running = traffic_process is not None and traffic_process.poll() is None
    
    return jsonify({
        'running': is_running,
        'pid': traffic_process.pid if is_running else None
    }), 200

@app.route('/api/metrics', methods=['GET'])
def metrics():
    """Get traffic metrics"""
    try:
        metrics = {
            'total_packets': 0,
            'http_packets': 0,
            'dns_packets': 0,
            'smtp_packets': 0,
            'ftp_packets': 0,
            'errors': 0,
        }
        
        if LOG_FILE.exists():
            with LOG_FILE.open('r') as f:
                for line in f:
                    if '[HTTP]' in line:
                        metrics['http_packets'] += 1
                    elif '[DNS]' in line:
                        metrics['dns_packets'] += 1
                    elif '[SMTP]' in line:
                        metrics['smtp_packets'] += 1
                    elif '[FTP]' in line:
                        metrics['ftp_packets'] += 1
                    if '[ERROR]' in line or '[WARNING]' in line:
                        metrics['errors'] += 1
        
        metrics['total_packets'] = sum([
            metrics['http_packets'],
            metrics['dns_packets'],
            metrics['smtp_packets'],
            metrics['ftp_packets']
        ])
        
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve index.html for all non-API routes (SPA routing)
@app.route('/', methods=['GET'])
def serve_index():
    if not FRONTEND_DIST_DIR.exists():
        return jsonify({
            'error': 'Frontend build not found',
            'message': 'Run the frontend build before starting the server.'
        }), 503
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_static(path):
    # If it's not a file in static folder, serve index.html (SPA routing)
    if path.startswith('api/'):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    if not FRONTEND_DIST_DIR.exists():
        return jsonify({
            'error': 'Frontend build not found',
            'message': 'Run the frontend build before starting the server.'
        }), 503

    file_path = FRONTEND_DIST_DIR / path
    if file_path.is_file():
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # For development: use debug mode
    # For production: disable debug and set to 0.0.0.0
    debug_mode = '--debug' in sys.argv or '--dev' in sys.argv
    host = 'localhost' if debug_mode else '0.0.0.0'
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=debug_mode, port=port, host=host, threaded=True)
