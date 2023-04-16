import { NextFunction, Request, Response } from 'express'
import DataURIParser from 'datauri/parser';
import { upload } from '../services/upload';

const imageFormats = [".jpg", ".jpeg", ".png", "jpg", "jpeg", "png", "octet-stream", "pdf", "csv", "doc"]
interface FileRequest extends Request{
  files: any;
}
const isValidFormat = (fileFormat) => {
  let isValidFile = false
  for(let i=0; i < imageFormats.length; i++){
    if(fileFormat === imageFormats[i]){
      isValidFile = true
      break
    }
  }
  return isValidFile
}


export default async function multipleUpload (req:FileRequest, res:Response, next:NextFunction) {
    try {
      let archiveFiles = req.files;
      if (!req.files){
        return next()
      }
      
      let multiplePicturePromise = []
      const parser = new DataURIParser()
      for (let i=0; archiveFiles.images && i<archiveFiles.images.length; i++){
          const image = await upload(req,res,next,archiveFiles.images[i],isValidFormat)
          multiplePicturePromise.push(image)
      }
     
      if (archiveFiles.images && !archiveFiles.images.length){
          const image = await upload(req,res,next,archiveFiles.images,isValidFormat)
          multiplePicturePromise.push(image)
      }

      //If there is avatar sent add the avatar to body
      if (archiveFiles.avatar && !archiveFiles.avatar.length){
          const avatar = await upload(req,res,next,archiveFiles.avatar,isValidFormat)
          req.body.avatar = avatar
      }

      if (archiveFiles.logo && !archiveFiles.logo.length){
        const logo = await upload(req,res,next,archiveFiles.logo,isValidFormat)
        req.body.logo = logo
      }

      if (archiveFiles.countryFlag && !archiveFiles.countryFlag.length){
        const countryFlag = await upload(req,res,next,archiveFiles.countryFlag,isValidFormat)
        req.body.countryFlag = countryFlag
      }

      req.body.photos = multiplePicturePromise
      next()
      return
    } catch (err) {
      next(err)
      return
    }
  }

