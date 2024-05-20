FROM node:21-alpine
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ENV IGNORE_DB=1
COPY . .
RUN pnpm run build

CMD ["sh", "-c", "pnpm run db:migrate; pnpm run start"]
