// 24/11/2025 AI-Tag
// Polychrome semi-transparent 2D radial shader (center transparent -> stronger at rim, capped opacity)

Shader "Custom/ShieldPolychromeUnlit_CenterTransparent"
{
    Properties
    {
        _Color ("Tint Color", Color) = (1,1,1,1) // global tint alpha used as multiplier
        _MainTex ("MainTex", 2D) = "white" {}
        _InnerRadius ("Inner Radius (fully transparent)", Range(0,1)) = 0.0
        _OuterRadius ("Outer Radius (where opacity reaches max)", Range(0,1)) = 0.5
        _Softness ("Edge Softness", Range(0,0.5)) = 0.05
        _MaxOpacity ("Max Rim Opacity (0..1)", Range(0,1)) = 0.6
        _Speed ("Hue Speed", Range(-5,5)) = 0.25
        _Saturation ("Saturation", Range(0,1)) = 1
        _Value ("Value/Brightness", Range(0,1)) = 1
        _HueOffset ("Hue Offset", Range(0,1)) = 0.0
    }
    SubShader
    {
        Tags { 
            "Queue"="Transparent" 
            "RenderType"="Transparent"
            "IgnoreProjector"="True"
            "PreviewType"="Plane"
            "CanUseSpriteAtlas"="True"
        }
        Cull Off
        ZWrite Off
        Blend SrcAlpha OneMinusSrcAlpha

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 pos : SV_POSITION;
            };

            sampler2D _MainTex;
            float4 _MainTex_ST;
            float4 _Color;
            float _InnerRadius;
            float _OuterRadius;
            float _Softness;
            float _MaxOpacity;
            float _Speed;
            float _Saturation;
            float _Value;
            float _HueOffset;

            v2f vert(appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.uv = TRANSFORM_TEX(v.uv, _MainTex);
                return o;
            }

            // simple hsv -> rgb
            float3 HSVtoRGB(float h, float s, float v)
            {
                float3 rgb = saturate(abs(frac(h + float3(0.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0) - 1.0);
                return v * lerp(float3(1.0,1.0,1.0), rgb, s);
            }

            fixed4 frag(v2f i) : SV_Target
            {
                // center UV at 0.5,0.5 for radial calculation
                float2 uv = i.uv;
                float2 center = float2(0.5, 0.5);
                float2 toCenter = uv - center;
                float dist = length(toCenter);

                // ensure inner <= outer
                float inner = _InnerRadius;
                float outer = _OuterRadius;
                if (inner > outer) { float tmp = inner; inner = outer; outer = tmp; }

                // If outer is zero or tiny, avoid divide by zero
                float span = max(0.0001, outer - inner);

                // Normalize distance between inner..outer (0..1)
                float t = saturate((dist - inner) / span);

                // apply softness by smoothing the t value a bit
                // softness in (0..0.5) controls how gradual transition is
                float softnessFactor = saturate(_Softness / max(0.0001, span));
                // Use smoothstep with softened boundaries for nicer edge
                float s = smoothstep(0.0 - softnessFactor, 1.0 + softnessFactor, t);

                // radialAlpha: center -> 0, rim -> _MaxOpacity
                float radialAlpha = lerp(0.0, _MaxOpacity, s);

                // early out if effectively transparent
                if (radialAlpha <= 0.00001)
                    return float4(0,0,0,0);

                // angle around center (0..1)
                float2 dir = toCenter;
                float angle = atan2(dir.y, dir.x); // -pi..pi
                float hue = (angle / (6.28318530718)) + 0.5; // map to 0..1

                // animate hue by time and offset
                float timeAnim = _Time.y * _Speed; // _Time.y is time in seconds
                hue = frac(hue + timeAnim + _HueOffset);

                float3 rgb = HSVtoRGB(hue, _Saturation, _Value);

                // sample texture for detail if needed (but don't use its alpha)
                fixed4 tex = tex2D(_MainTex, i.uv);

                // final color: rainbow tinted by _Color and texture
                // multiply colors, but alpha is from radialAlpha scaled by _Color.a
                float3 final = rgb * _Color.rgb * tex.rgb;
                float alpha = _Color.a * radialAlpha;

                return float4(final, alpha);
            }
            ENDCG
        }
    }
    FallBack "Unlit/Transparent"
}
