# SSL Certificates Directory

Place your SSL certificates here for HTTPS support:

- `cert.pem` - SSL certificate
- `key.pem` - SSL private key

## For Production (Let's Encrypt):
```bash
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./docker/nginx/ssl/key.pem
```

## For Development (Self-signed):
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./docker/nginx/ssl/key.pem \
  -out ./docker/nginx/ssl/cert.pem \
  -subj "/CN=localhost"
```

## Note:
The nginx configuration expects these files at `/etc/nginx/ssl/cert.pem` and `/etc/nginx/ssl/key.pem` inside the container.