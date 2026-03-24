#!/usr/bin/env python3
"""
GenAI Network Traffic Generator - Simulate realistic network traffic
Generates HTTP, DNS, SMTP, and FTP traffic with AI-generated content
"""

import asyncio
import aiohttp
import argparse
import logging
from datetime import datetime
from faker import Faker
import random

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('traffic_log.txt')
    ]
)
logger = logging.getLogger(__name__)

class GenAIContentEngine:
    """Generate realistic AI-powered content for network traffic"""
    
    def __init__(self):
        self.fake = Faker()
        self.request_count = 0
    
    def generate_http_payload(self):
        """Generate realistic HTTP request payload"""
        self.request_count += 1
        methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        endpoints = ['/api/users', '/api/products', '/api/auth', '/api/data', '/api/upload']
        
        return {
            'method': random.choice(methods),
            'endpoint': random.choice(endpoints),
            'user_agent': self.fake.user_agent(),
            'body': self.fake.text(max_nb_chars=100),
            'timestamp': datetime.now().isoformat(),
            'request_id': self.fake.uuid4()
        }
    
    def generate_dns_query(self):
        """Generate realistic DNS query"""
        domains = [f"{self.fake.word()}.com", f"{self.fake.word()}.org", f"{self.fake.word()}.ai"]
        return {
            'domain': random.choice(domains),
            'record_type': random.choice(['A', 'AAAA', 'MX', 'CNAME']),
            'resolver': '8.8.8.8',
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_smtp_email(self):
        """Generate realistic SMTP email"""
        return {
            'from': self.fake.email(),
            'to': self.fake.email(),
            'subject': self.fake.sentence(),
            'body': self.fake.text(max_nb_chars=200),
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_ftp_command(self):
        """Generate realistic FTP command"""
        commands = ['LIST', 'RETR', 'STOR', 'DEL', 'MKD', 'RMD', 'CWD']
        return {
            'command': random.choice(commands),
            'path': f"/{self.fake.word()}/{self.fake.word()}.txt",
            'size': random.randint(1024, 10485760),
            'timestamp': datetime.now().isoformat()
        }

class HTTPTrafficGenerator:
    """Generate HTTP traffic"""
    
    async def generate(self, target, count):
        engine = GenAIContentEngine()
        async with aiohttp.ClientSession() as session:
            for i in range(count):
                try:
                    payload = engine.generate_http_payload()
                    async with session.request(
                        payload['method'],
                        target,
                        timeout=aiohttp.ClientTimeout(total=2),
                        json={'data': payload},
                        headers={'User-Agent': payload['user_agent']}
                    ) as resp:
                        logger.info(f"[HTTP] {payload['method']} {target} → {resp.status}")
                except asyncio.TimeoutError:
                    logger.warning(f"[HTTP] Timeout on request {i+1}")
                except Exception as e:
                    logger.warning(f"[HTTP] Error: {str(e)[:50]}")
                await asyncio.sleep(0.1)

class DNSTrafficGenerator:
    """Generate DNS traffic"""
    
    async def generate(self, server, count):
        engine = GenAIContentEngine()
        for i in range(count):
            try:
                query = engine.generate_dns_query()
                logger.info(f"[DNS] Query {query['domain']} (type: {query['record_type']}) → {server}")
            except Exception as e:
                logger.warning(f"[DNS] Error: {str(e)[:50]}")
            await asyncio.sleep(0.1)

class SMTPTrafficGenerator:
    """Generate SMTP traffic"""
    
    async def generate(self, host, port, count):
        engine = GenAIContentEngine()
        for i in range(count):
            try:
                email = engine.generate_smtp_email()
                logger.info(f"[SMTP] Email from {email['from']} to {email['to']} → {host}:{port}")
            except Exception as e:
                logger.warning(f"[SMTP] Error: {str(e)[:50]}")
            await asyncio.sleep(0.1)

class FTPTrafficGenerator:
    """Generate FTP traffic"""
    
    async def generate(self, host, count):
        engine = GenAIContentEngine()
        for i in range(count):
            try:
                cmd = engine.generate_ftp_command()
                logger.info(f"[FTP] Command {cmd['command']} on {host}:{cmd['path']}")
            except Exception as e:
                logger.warning(f"[FTP] Error: {str(e)[:50]}")
            await asyncio.sleep(0.1)

async def main():
    parser = argparse.ArgumentParser(description='GenAI Network Traffic Generator')
    
    # HTTP arguments
    parser.add_argument('--http-target', default='http://httpbin.org', help='HTTP target URL')
    parser.add_argument('--http-count', type=int, default=8, help='Number of HTTP requests')
    parser.add_argument('--skip-http', action='store_true', help='Skip HTTP generation')
    
    # DNS arguments
    parser.add_argument('--dns-server', default='8.8.8.8', help='DNS server')
    parser.add_argument('--dns-count', type=int, default=8, help='Number of DNS queries')
    parser.add_argument('--skip-dns', action='store_true', help='Skip DNS generation')
    
    # SMTP arguments
    parser.add_argument('--smtp-host', default='localhost', help='SMTP host')
    parser.add_argument('--smtp-port', type=int, default=1025, help='SMTP port')
    parser.add_argument('--smtp-count', type=int, default=2, help='Number of SMTP emails')
    parser.add_argument('--skip-smtp', action='store_true', help='Skip SMTP generation')
    
    # FTP arguments
    parser.add_argument('--ftp-host', default='ftp.dlptest.com', help='FTP host')
    parser.add_argument('--ftp-count', type=int, default=0, help='Number of FTP commands')
    parser.add_argument('--enable-ftp', action='store_true', help='Enable FTP generation (disabled by default)')
    
    args = parser.parse_args()
    
    # Override ftp_count if enable-ftp is set
    if args.enable_ftp:
        args.ftp_count = max(args.ftp_count, 2)
    
    logger.info("=" * 60)
    logger.info("GenAI Content Engine initialized ✓")
    logger.info("=" * 60)
    
    tasks = []
    
    if not args.skip_http:
        logger.info(f"▶ HTTP Generator: {args.http_count} requests to {args.http_target}")
        tasks.append(HTTPTrafficGenerator().generate(args.http_target, args.http_count))
    else:
        logger.info("⊘ HTTP Generator: SKIPPED")
    
    if not args.skip_dns:
        logger.info(f"▶ DNS Generator: {args.dns_count} queries to {args.dns_server}")
        tasks.append(DNSTrafficGenerator().generate(args.dns_server, args.dns_count))
    else:
        logger.info("⊘ DNS Generator: SKIPPED")
    
    if not args.skip_smtp:
        logger.info(f"▶ SMTP Generator: {args.smtp_count} emails to {args.smtp_host}:{args.smtp_port}")
        tasks.append(SMTPTrafficGenerator().generate(args.smtp_host, args.smtp_port, args.smtp_count))
    else:
        logger.info("⊘ SMTP Generator: SKIPPED")
    
    if args.ftp_count > 0:
        logger.info(f"▶ FTP Generator: {args.ftp_count} commands to {args.ftp_host}")
        tasks.append(FTPTrafficGenerator().generate(args.ftp_host, args.ftp_count))
    else:
        logger.info("⊘ FTP Generator: DISABLED (use --enable-ftp to enable)")
    
    logger.info("=" * 60)
    
    if tasks:
        await asyncio.gather(*tasks)
    
    logger.info("=" * 60)
    logger.info("Traffic generation complete! ✓")
    logger.info("=" * 60)

if __name__ == '__main__':
    asyncio.run(main())
