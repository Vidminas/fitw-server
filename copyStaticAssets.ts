import { cp } from "shelljs";

cp("-u", `.env.${process.env.NODE_ENV || "prod"}`, "build/");
cp("-ur", "public/", "build/public/");
cp("-ur", "src/layouts/", "build/layouts/");
cp("-ur", "src/views/", "build/views/");
