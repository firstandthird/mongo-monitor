FROM firstandthird/node:10.10-2-onbuild

CMD ["dumb-init", "node", "bin.js"]
