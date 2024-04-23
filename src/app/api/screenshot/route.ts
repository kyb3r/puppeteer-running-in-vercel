import { NextRequest, NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";

export const dynamic = "force-dynamic";

async function getBrowser() {
  if (process.env.VERCEL_ENV === "production") {
    console.log("Using chromium");
    const executablePath = await chromium.executablePath();

    console.log(executablePath);

    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
    return browser;
  } else {
    const browser = await puppeteer.launch();
    return browser;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  let width = 1400;
  let height = 900;

  const viewportString = request.nextUrl.searchParams.get("viewport");

  if (viewportString) [width, height] = viewportString.split("x").map(Number);

  const darkMode = request.nextUrl.searchParams.get("darkMode") !== null;

  // const secret = request.nextUrl.searchParams.get("secret");

  // if (secret !== process.env.SECRET) {
  //   return new NextResponse("Unauthorized", {
  //     status: 403,
  //   });
  // }

  if (!url) {
    return new NextResponse("No url specified", {
      status: 400,
    });
  }

  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.setViewport({
    width: width,
    height: height,
  });

  if (darkMode) {
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: "dark" },
    ]);
  }

  await page.goto(url);
  const screenshot = await page.screenshot();
  await browser.close();

  return new NextResponse(screenshot, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
