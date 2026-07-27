FROM node:18-slim

# Install FFmpeg and Python for yt-dlp
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 10000
CMD ["npm", "start"]
