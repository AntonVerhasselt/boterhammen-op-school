import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signatureHeader = request.headers.get("stripe-signature");
    
    if (!signatureHeader) {
      return new Response("Missing stripe-signature header", {
        status: 400,
      });
    }
    
    const signature: string = signatureHeader;
    const payload = await request.text();

    const result = await ctx.runAction(internal.stripe.webhook.fulfill.fulfill, {
      signature,
      payload,
    });

    if (result.success) {
      return new Response(null, {
        status: 200,
      });
    } else {
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

export default http;

