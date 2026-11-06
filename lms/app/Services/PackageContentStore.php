<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class PackageContentStore
{
    public function import(array $manifest): array
    {
        return DB::transaction(function()use($manifest){
            $releases=[];$files=0;$bytes=0;
            foreach($manifest as $entry){
                $version=hash('sha256',json_encode($entry));
                $existing=DB::table('learning_package_definitions')->where('version',$version)->first();
                if($existing&&json_decode($existing->definition,true)!=$entry)throw new \RuntimeException('Definisi versi tidak konsisten.');
                if(!$existing)DB::table('learning_package_definitions')->insert(['version'=>$version,'slug'=>$entry['id'],'definition'=>json_encode($entry),'created_at'=>now(),'updated_at'=>now()]);
                $releases[$entry['contentVersion']]=true;
            }
            foreach(array_keys($releases) as $release){
                $root=storage_path('app/learning-pack/releases/'.$release.'/site');
                if(!is_dir($root))throw new \RuntimeException('Berkas rilis tidak tersedia.');
                $iterator=new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root,\FilesystemIterator::SKIP_DOTS));
                foreach($iterator as $file){
                    if(!$file->isFile()||$file->isLink())continue;
                    $path=str_replace(DIRECTORY_SEPARATOR,'/',substr($file->getPathname(),strlen($root)+1));
                    $content=file_get_contents($file->getPathname());$hash=hash('sha256',$content);
                    $existing=DB::table('learning_package_assets')->where('release',$release)->where('path',$path)->first();
                    if($existing&&($existing->sha256!==$hash||base64_decode($existing->content_base64,true)!==$content))throw new \RuntimeException('Isi rilis yang sama berbeda: '.$path);
                    if(!$existing)DB::table('learning_package_assets')->insert(['release'=>$release,'path'=>$path,'sha256'=>$hash,'content_base64'=>base64_encode($content),'created_at'=>now(),'updated_at'=>now()]);
                    $files++;$bytes+=strlen($content);
                }
            }
            return ['definitions'=>count($manifest),'assets'=>$files,'decodedBytes'=>$bytes];
        });
    }
}
