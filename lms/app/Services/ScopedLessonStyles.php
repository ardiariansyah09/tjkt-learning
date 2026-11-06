<?php
namespace App\Services;

class ScopedLessonStyles
{
    private const ROOT=':is(#lms-learning-root,#lms-learning-outline)';

    public function scope(string $css): string
    {
        $output='';$offset=0;$length=strlen($css);
        while($offset<$length){
            $start=$offset;$quote=null;$comment=false;$paren=0;
            for(;$offset<$length;$offset++){
                $c=$css[$offset];$next=$css[$offset+1]??'';
                if($comment){if($c==='*'&&$next==='/'){$comment=false;$offset++;}continue;}
                if($quote){if($c==='\\'){$offset++;continue;}if($c===$quote)$quote=null;continue;}
                if($c==='/'&&$next==='*'){$comment=true;$offset++;continue;}
                if($c==='"'||$c==="'"){$quote=$c;continue;}
                if($c==='('||$c==='[')$paren++;
                if($c===')'||$c===']')$paren--;
                if(!$paren&&($c==='{'||$c===';'))break;
            }
            if($offset===$length){$output.=substr($css,$start);break;}
            $header=substr($css,$start,$offset-$start);
            if($css[$offset]===';'){$output.=$header.';';$offset++;continue;}
            $bodyStart=++$offset;$depth=1;$quote=null;$comment=false;
            for(;$offset<$length;$offset++){
                $c=$css[$offset];$next=$css[$offset+1]??'';
                if($comment){if($c==='*'&&$next==='/'){$comment=false;$offset++;}continue;}
                if($quote){if($c==='\\'){$offset++;continue;}if($c===$quote)$quote=null;continue;}
                if($c==='/'&&$next==='*'){$comment=true;$offset++;continue;}
                if($c==='"'||$c==="'"){$quote=$c;continue;}
                if($c==='{')$depth++;
                if($c==='}'&&!--$depth)break;
            }
            $body=substr($css,$bodyStart,$offset-$bodyStart);$offset++;
            $clean=preg_replace('~^\s*(?:/\*.*?\*/\s*)*~s','',$header);
            $prefix=substr($header,0,strlen($header)-strlen($clean));
            if(str_starts_with($clean,'@')){
                if(preg_match('/^@(media|supports|container|layer|document)\b/i',$clean))$body=$this->scope($body);
                $output.=$header.'{'.$body.'}';
            }else{
                $output.=$prefix.$this->selectors($clean).'{'.$body.'}';
            }
        }
        return $output;
    }

    private function selectors(string $text): string
    {
        $parts=[];$start=0;$depth=0;$quote=null;
        for($i=0;$i<strlen($text);$i++){
            $c=$text[$i];if($quote){if($c==='\\')$i++;elseif($c===$quote)$quote=null;continue;}
            if($c==='"'||$c==="'"){$quote=$c;continue;}
            if($c==='('||$c==='[')$depth++;if($c===')'||$c===']')$depth--;
            if(!$depth&&$c===','){$parts[]=substr($text,$start,$i-$start);$start=$i+1;}
        }
        $parts[]=substr($text,$start);
        return implode(',',array_map(function($selector){
            $selector=trim($selector);
            $selector=preg_replace('/(?<![\w-])(?:html|body)(?![\w-])|:root/',self::ROOT,$selector);
            if(str_starts_with($selector,'.dark'))$selector=self::ROOT.$selector;
            if(!str_starts_with($selector,self::ROOT))$selector=self::ROOT.' '.$selector;
            return $selector;
        },$parts));
    }
}
