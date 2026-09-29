FROM node:22.23.2-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@11.19.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN HUSKY=0 pnpm install --frozen-lockfile
COPY . .
# Optional public build-time settings; use the same values as Vercel.
ARG PUBLIC_GOOGLE_SITE_VERIFICATION
ARG GISCUS_REPO
ARG GISCUS_REPO_ID
ARG GISCUS_CATEGORY_ID
ARG GISCUS_lang=zh-CN
RUN pnpm build

FROM nginx:stable-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
