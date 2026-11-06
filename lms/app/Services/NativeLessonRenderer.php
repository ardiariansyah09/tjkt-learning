<?php
namespace App\Services;

use App\Models\Module;

class NativeLessonRenderer
{
    public function render(Module $module,array $entry,string $back): array
    {
        $source=app(LearningPackage::class)->asset($entry,$entry['path'].'index.html');
        $document=new \DOMDocument('1.0','UTF-8');$previous=libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="UTF-8">'.$source);libxml_clear_errors();libxml_use_internal_errors($previous);
        $xpath=new \DOMXPath($document);$styles=[];$scripts=[];
        foreach(iterator_to_array($xpath->query('//script')) as $script){
            $src=$script->getAttribute('src');
            if(!str_contains($src,'local-instructor.js')){
                if($src)$script->setAttribute('src',$this->url($module,$entry,$src,$back));
                else $script->textContent=preg_replace_callback('~([\'"])(\.\./\.\./\.\./assets/[^\'"\r\n]+)\1~',fn($m)=>$m[1].$this->url($module,$entry,$m[2],$back).$m[1],$script->textContent);
                $scripts[]=$document->saveHTML($script);
            }
            $script->parentNode->removeChild($script);
        }
        foreach($xpath->query('//head/link[@rel="stylesheet"]') as $link)$styles[]=$this->url($module,$entry,$link->getAttribute('href'),$back);
        foreach(iterator_to_array($xpath->query('//*[contains(concat(" ",normalize-space(@class)," ")," module-topbar ")] | //body/a[contains(@class,"skip-link")] | //body/footer')) as $node)$node->parentNode->removeChild($node);
        foreach($xpath->query('//*[@href or @src]') as $node)foreach(['href','src'] as $attribute)if($node->hasAttribute($attribute))$node->setAttribute($attribute,$this->url($module,$entry,$node->getAttribute($attribute),$back));
        $aside=$xpath->query('//*[contains(concat(" ",normalize-space(@class)," ")," lesson-sidebar ")]')->item(0);
        if(!$aside)throw new \RuntimeException('Navigasi tahap modul tidak ditemukan.');
        foreach(iterator_to_array($xpath->query('.//*[contains(concat(" ",normalize-space(@class)," ")," sidebar-heading ")]',$aside)) as $node)$node->parentNode->removeChild($node);
        $outline=$document->saveHTML($aside);$aside->parentNode->removeChild($aside);
        foreach(iterator_to_array($xpath->query('//body//main')) as $main){
            $section=$document->createElement('section');foreach($main->attributes as $attribute)$section->setAttribute($attribute->name,$attribute->value);
            while($main->firstChild)$section->appendChild($main->firstChild);$main->parentNode->replaceChild($section,$main);
        }
        $body=$xpath->query('//body')->item(0);$content='';foreach($body->childNodes as $node)$content.=$document->saveHTML($node);
        return ['content'=>$content,'outline'=>$outline,'styles'=>array_values(array_unique($styles)),'scripts'=>$scripts,'classes'=>$body->getAttribute('class')];
    }

    private function url(Module $module,array $entry,string $url,string $back): string
    {
        if(preg_match('~^(?:https?:|data:|mailto:|tel:|//)~i',$url))return $url;
        if(str_starts_with($url,'#'))return route('packages.launch',$module).$url;
        $query=parse_url($url,PHP_URL_QUERY);$fragment=parse_url($url,PHP_URL_FRAGMENT);$path=parse_url($url,PHP_URL_PATH)??'';
        $parts=[];foreach(explode('/',$entry['path'].$path) as $part){if($part==='..')array_pop($parts);elseif($part!=='.'&&$part!=='')$parts[]=$part;}
        $path=implode('/',$parts);
        if($path==='index.html')return $back;
        if(str_starts_with($path,'modules/')){
            $target=collect(app(LearningPackage::class)->manifest())->first(fn($e)=>rtrim($e['path'],'/').'/index.html'===$path||rtrim($e['path'],'/')===rtrim($path,'/'));
            if($target&&$target['id']!==$entry['id']){$other=Module::where('package_slug',$target['id'])->first();if($other)return route('packages.launch',$other);}
        }
        return route('packages.file',[$module,$path]).($query?'?'.$query:'').($fragment?'#'.$fragment:'');
    }
}
