FROM firstandthird/node:8.1-3-onbuild

CMD ["dumb-init", "node", "bin.js"]
