# Dockerfile  

FROM nginx:latest  

# Copy custom nginx.conf to the container  
COPY ./nginx.conf /etc/nginx/nginx.conf  

# Ensure permissions are correct on the configuration file  
RUN chmod 644 /etc/nginx/nginx.conf  

# Ensure necessary directories  
RUN mkdir -p /var/log/nginx && \
    mkdir -p /etc/nginx/conf.d && \
    mkdir -p /etc/nginx/ssl  

# Optionally copy additional configs and certificates (if needed)  
# COPY ./path_to_extra_configs /etc/nginx/conf.d/  
# COPY ./ssl/* /etc/nginx/ssl/  

EXPOSE 80 443

# Run Nginx in the foreground  
CMD ["nginx", "-g", "daemon off;"]