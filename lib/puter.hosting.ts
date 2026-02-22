import puter from "@heyputer/puter.js";

import {
    HOSTING_CONFIG_KEY,
    createHostingSlug,
    isHostedUrl,
    imageUrlToPngBlob,
    fetchBlobFromUrl,
    getImageExtension,
    getHostedUrl,
  } from "./utils";
  

type HostingConfig={subdomain:string; };
type HostedAsset={ url: string};

export const getOrCreateHostingConfig= async():Promise<HostingConfig | null> =>{
        const existing = (await puter.kv.get(HOSTING_CONFIG_KEY)) as HostingConfig | null;
//i added this now:
        console.log("Creating hosting for user...");


        if(existing?.subdomain) return{subdomain:existing.subdomain};

        const subdomain = createHostingSlug();

        try{
            const created = await puter.hosting.create(subdomain,".");
            const config = {subdomain: created.subdomain};
            await puter.kv.set(HOSTING_CONFIG_KEY, config);

            return config;

        }catch(e){
            console.warn(`Could not create subdomain: ${e}`);
            return null;
        }
}


export const uploadImageToHosting = async (
    { hosting, url, projectId, label }: StoreHostedImageParams
  ): Promise<HostedAsset | null> => {
    if (!hosting || !url) return null;
    if (isHostedUrl(url)) return { url };
  
    try {
      const resolved =
        label === "rendered"
          ? await imageUrlToPngBlob(url).then(blob =>
              blob ? { blob, contentType: "image/png" } : null
            )
          : await fetchBlobFromUrl(url);
  
      if (!resolved) return null;
  
      const contentType = resolved.contentType || resolved.blob.type || "";
      const ext = getImageExtension(contentType, url);
  
      const dir = `projects/${projectId}`;
      const filePath = `${dir}/${label}.${ext}`;
  
      const uploadFile = new File([resolved.blob], `${label}.${ext}`, {
        type: contentType,
      });
  
      // retry mkdir (for new users)
      try {
        await puter.fs.mkdir(dir, { createMissingParents: true });
      } catch (err) {
        console.warn("mkdir failed once, retrying...", err);
        await new Promise(r => setTimeout(r, 500));
        await puter.fs.mkdir(dir, { createMissingParents: true });
      }
  
      // write file
      await puter.fs.write(filePath, uploadFile);
  
      const hostedUrl = getHostedUrl(
        { subdomain: hosting.subdomain },
        filePath
      );
  
      return hostedUrl ? { url: hostedUrl } : null;
  
    } catch (e) {
      console.warn("failed to store hosted image:", e);
      return null;
    }
  };